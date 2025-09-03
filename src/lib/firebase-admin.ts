// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { firebaseAdminConfig } from './firebase-config'; // Importar la config directamente

let adminApp: App | null = null;

function initializeFirebaseAdmin(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  console.log("🚀 Inicializando Firebase Admin...");

  // SOLUCIÓN DEFINITIVA: No especificar el storageBucket.
  // El SDK usará automáticamente el bucket por defecto asociado con las credenciales.
  const app = initializeApp({
    credential: cert(firebaseAdminConfig),
  });
  
  console.log('✅ Firebase Admin inicializado correctamente.');
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
