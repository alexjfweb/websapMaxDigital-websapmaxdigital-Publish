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

try {
  const firebaseConfig = getFirebaseConfig();

  if (firebaseConfig) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    console.log('✅ Firebase: Inicializado correctamente.');
  } else {
    console.warn("⚠️ Firebase: La configuración no está completa. Los servicios de Firebase no estarán disponibles. Revisa tu archivo .env.local.");
  }

} catch (error) {
  console.error('❌ Firebase: Error fatal durante la inicialización.', error);
}

export { app, auth, db, storage };
