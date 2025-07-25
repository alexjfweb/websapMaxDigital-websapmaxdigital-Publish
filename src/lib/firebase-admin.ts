// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import { adminFirebaseConfig } from './firebase-admin-config';

// Asegura que la inicialización de Firebase Admin ocurra solo una vez.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(adminFirebaseConfig.credential),
      storageBucket: adminFirebaseConfig.storageBucket,
    });
    console.log('✅ Firebase Admin SDK inicializado correctamente.');
  } catch (error: any) {
    console.error('❌ Error al inicializar Firebase Admin SDK:', error.message);
    // Puedes decidir si quieres que la aplicación falle si el Admin SDK no se inicializa.
    // throw error; 
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
