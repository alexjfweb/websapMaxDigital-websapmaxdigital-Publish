// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ATENCIÓN: Copia y pega aquí los valores EXACTOS de la configuración de Firebase
// que obtuviste de la Consola de Firebase para tu aplicación web "websapmax-proyect"
// dentro del proyecto "websapmax".
const firebaseConfig = {
  apiKey: "TU_API_KEY_DE_LA_APP_WEB_VA_AQUI", // <-- REEMPLAZA ESTO DESDE TU CONSOLA
  authDomain: "TU_AUTH_DOMAIN_DE_LA_APP_WEB_VA_AQUI", // <-- REEMPLAZA ESTO (ej: websapmax.firebaseapp.com)
  projectId: "websapmax", // Confirmado por tu captura de pantalla anterior
  storageBucket: "TU_STORAGE_BUCKET_DE_LA_APP_WEB_VA_AQUI", // <-- REEMPLAZA ESTO (ej: websapmax.appspot.com)
  messagingSenderId: "560613070255", // Confirmado por tu captura de pantalla anterior (ID del remitente)
  appId: "1:560613070255:web:7ce75870dbe6b19a084b5a", // Confirmado por tu captura de pantalla actual
  measurementId: "TU_MEASUREMENT_ID_OPCIONAL_VA_AQUI", // <-- REEMPLAZA ESTO (opcional, si lo tienes)
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
