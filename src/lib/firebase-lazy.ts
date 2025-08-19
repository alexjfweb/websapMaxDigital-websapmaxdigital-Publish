import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

function initializeServices() {
  if (!getApps().length) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error("Firebase config is missing or incomplete. Check your .env.local file.");
      throw new Error("Firebase config is incomplete and cannot be initialized.");
    }
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
  auth = getAuth(app);
}

// Inicializar los servicios una vez al cargar este módulo
initializeServices();

// Las funciones ahora devuelven la instancia ya creada.
// El "lazy" se refiere a que el módulo en sí puede ser cargado dinámicamente,
// pero una vez cargado, las instancias están disponibles.

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) initializeServices();
  return app;
};

export const getDb = (): Firestore => {
  if (!db) initializeServices();
  return db;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) initializeServices();
  return auth;
};
