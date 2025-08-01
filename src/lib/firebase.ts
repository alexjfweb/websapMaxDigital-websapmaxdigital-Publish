// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

let app: FirebaseApp;

// Función para inicializar y obtener la app, garantizando una única instancia.
function getFirebaseApp(): FirebaseApp {
  console.log("🔵 getFirebaseApp: Verificando estado de la app de Firebase...");
  if (getApps().length === 0) {
    if (!firebaseConfig.projectId) {
      console.error("🔴 ERROR: La configuración de Firebase está incompleta. No se puede inicializar.");
      throw new Error("Configuración de Firebase inválida.");
    }
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase App Initialized con éxito. Project ID:", firebaseConfig.projectId);
  } else {
    app = getApp();
    console.log("🟢 Firebase App ya estaba inicializada.");
  }
  return app;
}

// Exportamos la función que nos dará la app y los servicios que no dependen de Auth.
const db = getFirestore(getFirebaseApp());
const storage = getStorage(getFirebaseApp());

export { getFirebaseApp, db, storage };
