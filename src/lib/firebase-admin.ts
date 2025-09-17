// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { firebaseAdminConfig } from './firebase-config';

let adminApp: App | null = null;

function initializeFirebaseAdmin(): App {
  // Reutiliza la instancia si ya existe para evitar errores en hot-reload
  if (getApps().length > 0) {
    return getApps().find(app => app.name === 'websapmax-admin') || getApps()[0];
  }

  console.log("🚀 Inicializando Firebase Admin SDK por primera vez...");

  if (!firebaseAdminConfig || !firebaseAdminConfig.project_id) {
    console.error("❌ ERROR: La configuración de Firebase Admin está vacía o es inválida.");
    throw new Error("La configuración de Firebase Admin no está definida. Revisa tus variables de entorno o firebase-config.ts.");
  }

  try {
    const app = initializeApp({
      credential: cert(firebaseAdminConfig),
      // Apunta al bucket correcto
      storageBucket: 'websapmax.appspot.com',
    }, 'websapmax-admin'); // Dar un nombre a la app de admin para evitar conflictos
    
    console.log('✅ Firebase Admin inicializado correctamente para el proyecto:', app.name);
    return app;

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO AL INICIALIZAR FIREBASE ADMIN:", error.message);
    throw new Error(`Fallo en la inicialización de Firebase Admin: ${error.message}`);
  }
}

// Función singleton para obtener la instancia de la app de admin.
export function getFirebaseAdmin(): App {
  if (!adminApp) {
    adminApp = initializeFirebaseAdmin();
  }
  return adminApp;
}
