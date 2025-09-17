// src/lib/firebase.ts

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
let initializationPromise: Promise<FirebaseServices> | null = null;

function initializeFirebase(): Promise<FirebaseServices> {
  if (services) {
    return Promise.resolve(services);
  }

  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = new Promise((resolve, reject) => {
    if (getApps().length === 0) {
      if (!isFirebaseConfigValid()) {
        const error = new Error("La configuración de Firebase es inválida. Revisa firebase-config.ts");
        console.error("❌ Firebase Initialization Failed:", error.message);
        reject(error);
        return;
      }
      console.log("🔥 Inicializando Firebase por primera vez...");
      try {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        services = { app, auth, db };
        console.log("✅ Firebase inicializado correctamente.");
        resolve(services);
      } catch (error) {
        console.error("❌ Error durante la inicialización de Firebase:", error);
        reject(error);
      }
    } else {
      // console.log("♻️ Reutilizando instancia de Firebase existente...");
      const app = getApp();
      const auth = getAuth(app);
      const db = getFirestore(app);
      services = { app, auth, db };
      resolve(services);
    }
  });

  return initializationPromise;
}

// Export individual getters for convenience and to ensure initialization
export function getDb(): Firestore {
  if (!services) {
    throw new Error("Firebase no ha sido inicializado. Llama a initializeFirebase() primero.");
  }
  return services.db;
}

export function getFirebaseAuth(): Auth {
    if (!services) {
    throw new Error("Firebase no ha sido inicializado. Llama a initializeFirebase() primero.");
  }
  return services.auth;
}

export function getAppInstance(): FirebaseApp {
    if (!services) {
    throw new Error("Firebase no ha sido inicializado. Llama a initializeFirebase() primero.");
  }
  return services.app;
}

// Export the initialization function to be awaited
export { initializeFirebase };
