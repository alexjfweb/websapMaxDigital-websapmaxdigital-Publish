
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

let adminApp: admin.app.App;
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;
let adminStorage: admin.storage.Storage;

// Función de inicialización segura
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    console.log('🟢 Firebase Admin SDK ya estaba inicializado.');
    return admin.app();
  }

  try {
    if (!serviceAccountJson) {
      throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT no está definida. Es necesaria para el SDK de Administrador.');
    }
    
    const serviceAccount = JSON.parse(serviceAccountJson);

    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('El JSON de la cuenta de servicio es inválido o le faltan propiedades esenciales (project_id, private_key, client_email).');
    }
    
    if (!storageBucket) {
      throw new Error('La variable de entorno NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET no está definida. Es necesaria para la inicialización del bucket.');
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket,
    });
    console.log('✅ Firebase Admin SDK inicializado correctamente.');
    return app;

  } catch (error: any) {
    console.error('❌ Error al inicializar Firebase Admin SDK:', error.message);
    console.error('🔴 Asegúrate de que las variables de entorno FIREBASE_SERVICE_ACCOUNT y NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET sean correctas.');
    return null; // Devuelve null en caso de fallo
  }
}

// Llama a la función de inicialización.
adminApp = initializeFirebaseAdmin();

// Asigna los servicios solo si la inicialización fue exitosa.
if (adminApp) {
  adminAuth = admin.auth(adminApp);
  adminDb = admin.firestore(adminApp);
  adminStorage = admin.storage(adminApp);
} else {
  // Si la inicialización falló, asigna placeholders que lanzarán errores claros.
  console.error("🔴 La inicialización de Firebase Admin falló. Los servicios de admin no estarán disponibles.");
  const unavailableService = () => {
    throw new Error("Firebase Admin SDK no está disponible debido a un error de inicialización. Revisa los logs del servidor.");
  };
  // @ts-ignore
  adminAuth = unavailableService;
  // @ts-ignore
  adminDb = { collection: unavailableService }; // Proporcionar un objeto con la función que falla.
  // @ts-ignore
  adminStorage = unavailableService;
}

export { adminAuth, adminDb, adminStorage };
