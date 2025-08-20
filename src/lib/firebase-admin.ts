
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

let adminApp: admin.app.App | null = null;
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;
let adminStorage: admin.storage.Storage;

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    return;
  }

  try {
    const serviceAccountRaw = process.env.FIREBASE_ADMIN_CONFIG;
    if (!serviceAccountRaw || serviceAccountRaw.includes('PEGA_AQUI')) {
      throw new Error('La variable de entorno FIREBASE_ADMIN_CONFIG no está configurada correctamente en .env.local.');
    }

    const serviceAccount = JSON.parse(serviceAccountRaw);

    // **CORRECCIÓN DEFINITIVA:**
    // Restablecemos la corrección del formato de la clave privada.
    // Esto asegura que los saltos de línea se interpreten correctamente.
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    // Dejamos que el SDK infiera la configuración desde las credenciales,
    // que es el método más fiable.
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log(`✅ Firebase Admin SDK inicializado correctamente para el proyecto: ${adminApp.options.projectId}`);

  } catch (error: any) {
    console.error('🔴 ERROR CRÍTICO AL INICIALIZAR FIREBASE ADMIN:', error.stack);
    adminApp = null;
  }
}

// Inicializar al cargar el módulo.
initializeFirebaseAdmin();

if (adminApp) {
  adminAuth = admin.auth(adminApp);
  adminDb = admin.firestore(adminApp);
  adminStorage = admin.storage(adminApp);
} else {
  // Si la inicialización falló, los servicios lanzarán un error claro.
  const unavailableService = () => {
    throw new Error("El SDK de Firebase Admin no está disponible debido a un error crítico de inicialización. Revisa los logs de la terminal.");
  };
  // @ts-ignore
  adminAuth = unavailableService;
  // @ts-ignore
  adminDb = { collection: unavailableService, doc: unavailableService };
  // @ts-ignore
  adminStorage = unavailableService;
}

export { admin, adminAuth, adminDb, adminStorage };
