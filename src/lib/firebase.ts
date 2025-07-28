// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config'; // Importar directamente la configuración

// Validamos que el projectId exista para evitar el error "configuration-not-found"
if (!firebaseConfig.projectId) {
  console.error("Firebase projectId no encontrado en la configuración importada. Revisa src/lib/firebase-config.ts.");
  // Detener la ejecución si la configuración es inválida para evitar errores crípticos.
  throw new Error("Configuración de Firebase inválida.");
}

// Aseguramos que la inicialización ocurra solo una vez.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
