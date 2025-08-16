import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config'; // Importar la configuración centralizada

// Patrón Singleton para una inicialización segura de Firebase
function getFirebaseApp(): FirebaseApp {
  // Validar que la configuración no esté vacía antes de inicializar
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase config is missing or incomplete. Check your .env.local file.");
    // Esto podría lanzar un error para detener la ejecución si la config es vital
  }
  
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = getFirebaseApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Exporta las instancias que necesitas en tu aplicación
export { app, db, auth, getFirebaseApp };
