
// src/lib/firebase-lazy.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './firebase-config';

let appInstance: ReturnType<typeof initializeApp>;
let authInstance: ReturnType<typeof getAuth>;
let dbInstance: ReturnType<typeof getFirestore>;

function initializeFirebase() {
  if (!isFirebaseConfigValid()) {
    throw new Error("La configuración de Firebase es inválida. Revisa firebase-config.ts");
  }
  if (!getApps().length) {
    appInstance = initializeApp(firebaseConfig);
  } else {
    appInstance = getApp();
  }
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
}

// Inicializa Firebase la primera vez que se importa el módulo.
initializeFirebase();

// Exporta funciones que devuelven la instancia, asegurando que estén inicializadas.
export const getFirebaseAuth = () => {
    if (!authInstance) initializeFirebase();
    return authInstance;
};

export const getDb = () => {
    if (!dbInstance) initializeFirebase();
    return dbInstance;
};

export const getFirebaseApp = () => {
    if(!appInstance) initializeFirebase();
    return appInstance;
}
