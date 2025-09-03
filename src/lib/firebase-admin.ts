
// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { firebaseAdminConfig } from './firebase-config'; // Importar la config directamente

let adminApp: App | null = null;

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  console.log("🚀 Inicializando Firebase Admin con configuración explícita...");

  try {
    const app = initializeApp({
      credential: cert(firebaseAdminConfig),
      storageBucket: 'websapmax.appspot.com', // Nombre explícito y correcto del bucket
    });
    
    console.log('✅ Firebase Admin inicializado correctamente.');
    return app;

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO AL INICIALIZAR FIREBASE ADMIN:", error.message);
    // Relanzar el error para que sea visible en los logs del servidor
    throw new Error(`Fallo en la inicialización de Firebase Admin: ${error.message}`);
  }
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

// Función de verificación simplificada
export function verifyFirebaseConfig() {
  try {
    // La simple existencia de la config es suficiente ahora
    if (firebaseAdminConfig && firebaseAdminConfig.project_id) {
        return { isValid: true, error: null, projectId: firebaseAdminConfig.project_id, clientEmail: firebaseAdminConfig.client_email };
    }
    throw new Error("El objeto firebaseAdminConfig no está definido o es inválido.");
  } catch (error: any) {
    return { isValid: false, error: error.message, projectId: null, clientEmail: null };
  }
}
