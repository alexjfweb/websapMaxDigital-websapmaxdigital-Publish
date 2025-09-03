
// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './firebase-config';

// Asegurarse de que la configuración sea válida antes de proceder.
if (!isFirebaseConfigValid()) {
  throw new Error("La configuración de Firebase no es válida. Por favor, revisa el archivo src/lib/firebase-config.ts");
}

// Inicializa Firebase App solo una vez.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Obtiene y exporta las instancias de los servicios de Firebase.
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
