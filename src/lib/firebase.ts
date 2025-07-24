// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getFirebaseConfig } from './firebase-config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage = null;

try {
  const firebaseConfig = getFirebaseConfig();

  // Solo inicializar si la configuración es válida
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
    // No hacer nada si la configuración no está completa.
    // El mensaje de advertencia ya se mostró en getFirebaseConfig.
    console.warn("🟡 Firebase: La inicialización se omitió porque faltan variables de entorno.");
  }

} catch (error) {
  console.error('❌ Firebase: Error fatal durante la inicialización.', error);
  // No volver a lanzar el error para no detener la aplicación
}

// Exporta las instancias, que pueden ser null si la inicialización falló
export { app, auth, db, storage };
