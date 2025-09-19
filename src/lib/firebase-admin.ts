// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { serviceAccountConfig } from './firebase-config-server'; // Importar la configuración directamente.

let adminApp: App;

// Esta función es la única responsable de la configuración y la inicialización del Admin SDK.
function getFirebaseAdmin(): App {
  // Evita reinicializar la app en entornos de desarrollo con hot-reloading.
  if (getApps().some(app => app.name === 'websapmax-admin')) {
    return getApps().find(app => app.name === 'websapmax-admin')!;
  }
  
  try {
    adminApp = initializeApp({
      credential: cert(serviceAccountConfig),
      storageBucket: `${serviceAccountConfig.project_id}.appspot.com`,
    }, 'websapmax-admin');
    
    console.log("✅ Firebase Admin SDK inicializado correctamente.");
    return adminApp;

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO: No se pudo inicializar Firebase Admin.", error.message);
    // Este error se propagará y será capturado en la ruta de la API.
    throw new Error("Las credenciales de Firebase Admin son inválidas o están mal formateadas.");
  }
}

export { getFirebaseAdmin };
