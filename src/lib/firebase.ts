// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFirebaseConfig } from './firebase-config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Esta función se asegura de que Firebase se inicialice solo una vez.
const firebaseConfig = getFirebaseConfig();

if (firebaseConfig) {
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase: Inicializado por primera vez.');
      } catch (error) {
        console.error('❌ Firebase: Error fatal durante la inicialización.', error);
        // En un caso real, podrías querer manejar este error de una forma más visible.
      }
    } else {
      app = getApp();
      console.log('✅ Firebase: Usando instancia existente.');
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
} else {
    console.warn("⚠️ Firebase: La configuración no está disponible, la inicialización se omite.");
    // app, auth, db y storage permanecerán sin inicializar
}


export { app, auth, db, storage };
