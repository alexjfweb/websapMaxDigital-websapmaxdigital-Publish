
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './firebase-config';

// Patrón Singleton para una inicialización segura y única de Firebase en Next.js.
// Esto previene errores de "Too Many Requests" y asegura que la conexión sea estable.

let app: FirebaseApp;
let db: any;
let auth: any;

if (isFirebaseConfigValid()) {
  // Comprueba si ya existe una instancia de la aplicación para evitar reinicializaciones.
  if (!getApps().length) {
    // Si no hay ninguna app, inicializa una nueva.
    app = initializeApp(firebaseConfig);
  } else {
    // Si ya existe, obtén la instancia actual.
    app = getApp();
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  // Si la configuración no es válida, se loguea un error crítico en la consola.
  // La app no funcionará correctamente con Firebase, pero evitamos un crash completo aquí.
  console.error("CRITICAL ERROR: Firebase config is invalid. Firebase services will not be available.");
  app = null as any;
  db = null as any;
  auth = null as any;
}

// Exporta las instancias para ser usadas en toda la aplicación.
export { app, db, auth };
