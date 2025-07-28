// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config'; // Importar la configuración directamente

// Validación para asegurar que todas las variables de la configuración importada existan
const missingConfig = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  const errorMessage = `Faltan las siguientes variables en la configuración de Firebase importada: ${missingConfig.join(', ')}.`;
  console.error(errorMessage);
  // En un entorno de producción, podrías querer lanzar un error para detener la ejecución.
  // throw new Error(errorMessage);
}


// Asegura que la inicialización ocurra solo una vez.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
