// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFirebaseConfig } from './firebase-config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Ejecutar la inicialización solo en el lado del cliente
if (typeof window !== 'undefined') {
  try {
    const firebaseConfig = getFirebaseConfig();

    if (firebaseConfig) {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase: Inicializado por primera vez en el cliente.');
      } else {
        app = getApp();
        console.log('✅ Firebase: Usando instancia existente en el cliente.');
      }

      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);

    } else {
      console.warn("⚠️ Firebase: La configuración no está completa. Los servicios de Firebase no estarán disponibles. Revisa tu archivo .env.local.");
    }

  } catch (error) {
    console.error('❌ Firebase: Error fatal durante la inicialización en el cliente.', error);
  }
} else {
  console.info("ℹ️ Firebase: La inicialización se omite en el servidor. Se inicializará en el cliente.");
}

export { app, auth, db, storage };
