// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

let app: FirebaseApp;

// Función para inicializar y obtener la app, garantizando una única instancia.
function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase App Initialized");
  } else {
    app = getApp();
  }
  return app;
}

// Exportamos la función que nos dará la app y los servicios que no dependen de Auth.
const db = getFirestore(getFirebaseApp());
const storage = getStorage(getFirebaseApp());

export { getFirebaseApp, db, storage };
