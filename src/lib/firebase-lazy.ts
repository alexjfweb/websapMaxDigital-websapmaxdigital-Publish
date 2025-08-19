import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

let firebaseConfig: any = null;
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// Función para cargar la config de forma lazy
async function loadFirebaseConfig() {
  if (!firebaseConfig) {
    // La importación dinámica retrasa la carga del archivo de configuración
    const { firebaseConfig: config } = await import('./firebase-config');
    firebaseConfig = config;
  }
  return firebaseConfig;
}

// Función lazy para inicializar Firebase
async function initFirebase() {
  // Si la app ya está inicializada, la devolvemos directamente
  if (app && db && auth) {
    return { app, db, auth };
  }
  
  const config = await loadFirebaseConfig();
  
  if (!config.apiKey || !config.projectId) {
    console.error("Firebase config is missing or incomplete. Check your .env.local file.");
    throw new Error("Firebase config is incomplete");
  }
  
  // Inicializamos la app si no existe
  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApp();
  }
  
  // Obtenemos las instancias de los servicios
  db = getFirestore(app);
  auth = getAuth(app);
  
  return { app, db, auth };
}

// Exportamos funciones que aseguran la inicialización antes de devolver la instancia

export const getFirebaseApp = async (): Promise<FirebaseApp> => {
  const { app } = await initFirebase();
  return app!;
};

export const getDb = async (): Promise<Firestore> => {
  const { db } = await initFirebase();
  return db!;
};

export const getFirebaseAuth = async (): Promise<Auth> => {
  const { auth } = await initFirebase();
  return auth!;
};
