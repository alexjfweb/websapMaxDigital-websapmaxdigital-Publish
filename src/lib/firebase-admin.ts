
// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, ServiceAccount, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

// Forzar la carga de las variables de entorno desde .env.local
dotenv.config();

let adminApp: App | null = null;

function getServiceAccountCredentials(): ServiceAccount {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY no está configurada.');
  }
  try {
    return JSON.parse(serviceAccountKey);
  } catch (error: any) {
    console.error('Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    throw new Error(`Error al parsear las credenciales JSON: ${error.message}`);
  }
}

function initializeFirebaseAdmin(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const credentials = getServiceAccountCredentials();
  
  const app = initializeApp({
    credential: cert(credentials),
    storageBucket: 'websapmax.appspot.com'
  });
  
  console.log('✅ Firebase Admin inicializado correctamente para el bucket: websapmax.appspot.com');
  return app;
}

export function getFirebaseAdmin(): App {
  if (!adminApp) {
    adminApp = initializeFirebaseAdmin();
  }
  return adminApp;
}

export function getFirebaseStorage() {
  const app = getFirebaseAdmin();
  return getStorage(app);
}

export function verifyFirebaseConfig() {
  try {
    getServiceAccountCredentials();
    getFirebaseAdmin();
    return { isValid: true, error: null };
  } catch (error: any) {
    return { isValid: false, error: error.message };
  }
}
