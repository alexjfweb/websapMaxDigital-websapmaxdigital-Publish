// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config'; // Importar la configuración directamente

// Asegura que la inicialización ocurra solo una vez.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getApp() ? getAuth(app) : undefined;
export const storage = getApp() ? getStorage(app) : undefined;
export const db = getApp() ? getFirestore(app) : undefined;
