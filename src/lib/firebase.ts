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

const firebaseConfig = getFirebaseConfig();

if (!firebaseConfig) {
  // Si la configuración no está disponible, no podemos continuar.
  // Esto es preferible a dejar las variables sin inicializar.
  throw new Error("Firebase no pudo inicializarse. Verifica la consola para más detalles.");
}

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase: Inicializado por primera vez.');
  } else {
    app = getApp();
    console.log('✅ Firebase: Usando instancia existente.');
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

} catch (error) {
  console.error('❌ Firebase: Error fatal durante la inicialización.', error);
  throw new Error("Firebase no pudo inicializarse. Verifica la consola para más detalles.");
}

export { app, auth, db, storage };
