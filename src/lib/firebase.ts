
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

let app: FirebaseApp;

// Función para inicializar y obtener la app, garantizando una única instancia.
function getFirebaseApp(): FirebaseApp {
  console.log("🔵 getFirebaseApp: Verificando estado de la app de Firebase...");
  if (!firebaseConfig.projectId) {
    console.error("🔴 ERROR: La configuración de Firebase está incompleta. No se puede inicializar.");
    throw new Error("Configuración de Firebase inválida.");
  }
  if (getApps().length === 0) {
    console.log("🟠 Inicializando nueva instancia de Firebase con projectId:", firebaseConfig.projectId);
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase App Initialized con éxito.");
  } else {
    app = getApp();
    console.log("🟢 Firebase App ya estaba inicializada.");
  }
  return app;
}

const appInstance = getFirebaseApp();
const db = getFirestore(appInstance);

// Solución al problema de CORS: Especificar explícitamente el bucket de almacenamiento.
const storage = getStorage(appInstance, firebaseConfig.storageBucket);

export { getFirebaseApp, db, storage };
