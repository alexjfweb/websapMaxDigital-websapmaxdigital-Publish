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

// Esta función se asegura de que Firebase se inicialice solo una vez.
const initializeFirebase = () => {
  if (getApps().length) {
    console.log('✅ Firebase: Usando instancia existente.');
    app = getApp();
  } else {
    const firebaseConfig = getFirebaseConfig();
    if (firebaseConfig) {
      try {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase: Inicializado por primera vez.');
      } catch (error) {
        console.error('❌ Firebase: Error fatal durante la inicialización.', error);
        app = null; // Asegurarse de que app es null si falla
      }
    } else {
       console.warn("⚠️ Firebase: La configuración no está disponible, la inicialización se omite.");
    }
  }

  // Solo inicializar los servicios si la app se inicializó correctamente
  if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
};

// Llamar a la función de inicialización para que se ejecute cuando se importe el módulo
initializeFirebase();

export { app, auth, db, storage };
