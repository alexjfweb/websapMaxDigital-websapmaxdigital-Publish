// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import { serviceAccount } from './firebase-admin-config';

export const BUCKET_NAME = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

let adminApp: admin.app.App;

if (!admin.apps.length) {
  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
    console.log('✅ Firebase Admin SDK inicializado correctamente.');
  } catch (error: any) {
    console.error('❌ Error al inicializar Firebase Admin SDK:', error.message);
    // En un entorno de producción, podrías querer manejar esto de forma más robusta.
  }
} else {
  adminApp = admin.app();
  console.log('🟢 Firebase Admin SDK ya estaba inicializado.');
}

export const adminAuth = adminApp.auth();
export const adminDb = adminApp.firestore();
export const adminStorage = adminApp.storage();
