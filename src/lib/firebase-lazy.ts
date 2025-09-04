
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
    console.log("🔥 Inicializando Firebase por primera vez...");
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  } else {
    // console.log("♻️ Reutilizando instancia de Firebase existente...");
    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  }
}

function getFirebaseServices(): FirebaseServices {
    if (!services) {
        services = initializeFirebase();
    }
    return services;
}

// Export individual getters for convenience and to ensure initialization
export function getDb(): Firestore {
  return getFirebaseServices().db;
}

export function getAuthInstance(): Auth {
  return getFirebaseServices().auth;
}

export function getAppInstance(): FirebaseApp {
  return getFirebaseServices().app;
}

// Keep the original export for any code that might still use it
export { getFirebaseServices };
