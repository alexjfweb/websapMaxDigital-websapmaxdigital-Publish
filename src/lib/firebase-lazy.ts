// src/lib/firebase-lazy.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './firebase-config';

interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
}

let services: FirebaseServices | null = null;

function initializeFirebase(): FirebaseServices {
  if (getApps().length === 0) {
    if (!isFirebaseConfigValid()) {
      throw new Error("La configuración de Firebase es inválida. Revisa firebase-config.ts");
    }
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  } else {
    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  }
}

export function getFirebaseServices(): FirebaseServices {
    if (!services) {
        services = initializeFirebase();
    }
    return services;
}
