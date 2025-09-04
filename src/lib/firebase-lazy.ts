
// src/lib/firebase-lazy.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './firebase-config';

let appInstance: ReturnType<typeof initializeApp> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;

function initializeFirebase() {
  if (getApps().length === 0) {
    if (!isFirebaseConfigValid()) {
      throw new Error("La configuración de Firebase es inválida. Revisa firebase-config.ts");
    }
    appInstance = initializeApp(firebaseConfig);
  } else {
    appInstance = getApp();
  }
  
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
}

// Exporta funciones que devuelven la instancia, asegurando que estén inicializadas.
export const getFirebaseAuth = (): ReturnType<typeof getAuth> => {
    if (!authInstance) initializeFirebase();
    return authInstance!;
};

export const getDb = (): ReturnType<typeof getFirestore> => {
    if (!dbInstance) initializeFirebase();
    return dbInstance!;
};

export const getFirebaseApp = (): ReturnType<typeof initializeApp> => {
    if(!appInstance) initializeFirebase();
    return appInstance!;
}
