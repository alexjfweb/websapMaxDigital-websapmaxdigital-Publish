// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Objeto de configuración de Firebase construido a partir de variables de entorno
// Es crucial que las variables en tu archivo .env.local tengan el prefijo NEXT_PUBLIC_
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validación para asegurar que todas las variables de entorno se cargaron correctamente
const missingConfig = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  const errorMessage = ` Faltan las siguientes variables de entorno de Firebase: ${missingConfig.join(', ')}. Asegúrate de que estén definidas en tu archivo .env.local y que tengan el prefijo NEXT_PUBLIC_`;
  console.error(errorMessage);
  // Lanzar un error previene que la app intente inicializar Firebase con una config incompleta
  // throw new Error(errorMessage);
}


// Asegura que la inicialización ocurra solo una vez.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
