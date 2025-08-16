// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import { serviceAccount } from './firebase-admin-config';

export const BUCKET_NAME = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

let adminApp: admin.app.App | undefined;
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;
let adminStorage: admin.storage.Storage;

if (admin.apps.length === 0) {
  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: BUCKET_NAME,
    });
    console.log('✅ Firebase Admin SDK inicializado correctamente.');
  } catch (error: any) {
    console.error('❌ Error al inicializar Firebase Admin SDK:', error.message);
    console.error('🔴 Asegúrate de que las variables de entorno FIREBASE_ADMIN_* estén configuradas correctamente en tu entorno de despliegue.');
  }
} else {
  adminApp = admin.app();
  console.log('🟢 Firebase Admin SDK ya estaba inicializado.');
}

if (adminApp) {
  adminAuth = adminApp.auth();
  adminDb = adminApp.firestore();
  adminStorage = adminApp.storage();
} else {
  // En caso de que la inicialización falle, asignamos placeholders para evitar que la app crashee al importar.
  // Los errores se lanzarán en tiempo de ejecución si se intentan usar.
  console.error("🔴 La inicialización de Firebase Admin falló. Los servicios de admin no estarán disponibles.");
  const unavailableService = () => {
    throw new Error("Firebase Admin SDK no está disponible debido a un error de inicialización.");
  };
  adminAuth = unavailableService as any;
  adminDb = unavailableService as any;
  adminStorage = unavailableService as any;
}


export { adminAuth, adminDb, adminStorage };
