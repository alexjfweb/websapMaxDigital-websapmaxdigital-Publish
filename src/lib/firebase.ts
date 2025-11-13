// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// --- Configuración del Cliente (Pública y Segura) ---
// Estas credenciales son públicas y se utilizan para que el navegador
// se comunique con los servicios de Firebase a los que tiene permiso.
const firebaseConfig = {
    apiKey: "AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg",
    authDomain: "websapmax.firebaseapp.com",
    projectId: "websapmax",
    storageBucket: "websapmax-images",
    messagingSenderId: "560613070255",
    appId: "1:560613070255:web:7ce75870dbe6b19a084b5a",
    measurementId: "G-DD5JWPV701"
};

let app: FirebaseApp;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

export const firebaseApp = app;
export const storage = getStorage(app);
export const db = getFirestore(app);

export function getDb(): Firestore {
  return db;
}

export function getFirebaseAuth(): Auth {
  return getAuth(app);
}
