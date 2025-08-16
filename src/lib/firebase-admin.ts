// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// La configuración se leerá ahora de una única variable de entorno.
// Esto es más seguro y menos propenso a errores que manejar múltiples variables.
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

export const BUCKET_NAME = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

let adminApp: admin.app.App | undefined;
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;
let adminStorage: admin.storage.Storage;

if (admin.apps.length === 0) {
  try {
    if (!serviceAccountJson) {
      throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT no está definida. Es necesaria para el SDK de Administrador.');
    }
    
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Validar que las propiedades esenciales existan después de parsear
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('El JSON de la cuenta de servicio es inválido o le faltan propiedades esenciales.');
    }

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
    console.log('✅ Firebase Admin SDK inicializado correctamente.');

  } catch (error: any) {
    console.error('❌ Error al inicializar Firebase Admin SDK:', error.message);
    // Este mensaje es crucial para el debug
    console.error('🔴 Asegúrate de que la variable de entorno FIREBASE_SERVICE_ACCOUNT contenga un JSON válido de la cuenta de servicio de Firebase.');
  }
} else {
  adminApp = admin.app();
  console.log('🟢 Firebase Admin SDK ya estaba inicializado.');
}

// Asignar los servicios solo si la inicialización fue exitosa
if (adminApp) {
  adminAuth = adminApp.auth();
  adminDb = adminApp.firestore();
  adminStorage = adminApp.storage();
} else {
  // En caso de fallo, asignamos placeholders que lanzarán errores claros.
  console.error("🔴 La inicialización de Firebase Admin falló. Los servicios de admin no estarán disponibles.");
  const unavailableService = () => {
    throw new Error("Firebase Admin SDK no está disponible debido a un error de inicialización. Revisa los logs del servidor.");
  };
  adminAuth = unavailableService as any;
  adminDb = unavailableService as any;
  adminStorage = unavailableService as any;
}

export { adminAuth, adminDb, adminStorage };
