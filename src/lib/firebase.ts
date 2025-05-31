// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ATENCIÓN: Debes reemplazar los siguientes valores con las credenciales REALES
// de tu proyecto Firebase "restolink-gewb4" desde la consola de Firebase.
const firebaseConfig = {
  apiKey: "TU_API_KEY_DE_RESTOLINK-GEWB4", // <-- REEMPLAZA ESTO
  authDomain: "TU_AUTH_DOMAIN_DE_RESTOLINK-GEWB4", // <-- REEMPLAZA ESTO (ej: restolink-gewb4.firebaseapp.com)
  projectId: "restolink-gewb4", // Este es el ID del proyecto que elegiste
  storageBucket: "TU_STORAGE_BUCKET_DE_RESTOLINK-GEWB4", // <-- REEMPLAZA ESTO (ej: restolink-gewb4.appspot.com)
  messagingSenderId: "TU_MESSAGING_SENDER_ID_DE_RESTOLINK-GEWB4", // <-- REEMPLAZA ESTO
  appId: "TU_APP_ID_DE_RESTOLINK-GEWB4", // <-- REEMPLAZA ESTO
  measurementId: "TU_MEASUREMENT_ID_DE_RESTOLINK-GEWB4", // Opcional, pero reemplaza si lo usas
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