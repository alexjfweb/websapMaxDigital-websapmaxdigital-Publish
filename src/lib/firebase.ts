// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ATENCIÓN: Después de registrar tu aplicación WEB en la consola de Firebase
// para el proyecto "websapmax", copia el objeto firebaseConfig completo aquí.
const firebaseConfig = {
  apiKey: "TU_API_KEY_DE_LA_APP_WEB_VA_AQUI", // <-- REEMPLAZA ESTO
  authDomain: "TU_AUTH_DOMAIN_DE_LA_APP_WEB_VA_AQUI", // <-- REEMPLAZA ESTO (ej: websapmax.firebaseapp.com)
  projectId: "websapmax", // Este es el ID de tu proyecto
  storageBucket: "TU_STORAGE_BUCKET_DE_LA_APP_WEB_VA_AQUI", // <-- REEMPLAZA ESTO (ej: websapmax.appspot.com)
  messagingSenderId: "TU_MESSAGING_SENDER_ID_DE_LA_APP_WEB_VA_AQUI", // <-- REEMPLAZA ESTO (probablemente 560613070255)
  appId: "TU_APP_ID_DE_LA_APP_WEB_VA_AQUI", // <-- REEMPLAZA ESTO
  measurementId: "TU_MEASUREMENT_ID_OPCIONAL_VA_AQUI", // <-- REEMPLAZA ESTO (opcional)
};


let app: FirebaseApp;
if (!getApps().length) {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
} else {
  // Si ya hay una app inicializada, usarla
  app = getApp();
}
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };