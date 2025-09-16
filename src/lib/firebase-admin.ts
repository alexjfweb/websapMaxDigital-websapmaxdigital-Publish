// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { firebaseAdminConfig } from './firebase-config'; // Importar la config directamente

let adminApp: App | null = null;

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    // Si ya hay una app inicializada, la reutilizamos.
    // Esto es importante para evitar errores en entornos de desarrollo con hot-reloading.
    return getApps()[0];
  }

  console.log("🚀 Inicializando Firebase Admin SDK...");

  // Validar que la configuración importada no esté vacía
  if (!firebaseAdminConfig || !firebaseAdminConfig.project_id) {
    console.error("❌ ERROR: La configuración de firebaseAdminConfig está vacía o es inválida.");
    throw new Error("La configuración de Firebase Admin no está definida. Revisa tus variables de entorno o firebase-config.ts.");
  }

  try {
    const app = initializeApp({
      credential: cert(firebaseAdminConfig),
      storageBucket: 'websapmax.appspot.com', // Nombre explícito y correcto del bucket
    });
    
    console.log('✅ Firebase Admin inicializado correctamente para el proyecto:', app.name);
    return app;

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO AL INICIALIZAR FIREBASE ADMIN:", error.message);
    // Lanzar el error para que la API que lo usa falle y devuelva un 500 claro.
    throw new Error(`Fallo en la inicialización de Firebase Admin: ${error.message}`);
  }
}

// Función principal para obtener la instancia de la app de admin.
export function getFirebaseAdmin(): App {
  // Esta es una forma de asegurar que solo se inicialice una vez (patrón singleton)
  if (!adminApp) {
    adminApp = initializeFirebaseAdmin();
  }
  return adminApp;
}
