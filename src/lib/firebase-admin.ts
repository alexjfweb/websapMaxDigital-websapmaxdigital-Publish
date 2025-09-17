
// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { firebaseAdminConfig } from './firebase-config';

let adminApp: App;

// Esta es una función singleton que asegura que Firebase Admin se inicialice solo una vez.
function getFirebaseAdmin(): App {
  if (getApps().some(app => app.name === 'websapmax-admin')) {
    return getApps().find(app => app.name === 'websapmax-admin')!;
  }

  if (!firebaseAdminConfig || !firebaseAdminConfig.project_id) {
    console.error("❌ ERROR CRÍTICO: La configuración de Firebase Admin no está definida o es inválida.");
    throw new Error("La configuración del servidor de Firebase no está completa. Revisa tus variables de entorno.");
  }

  console.log("🚀 Inicializando Firebase Admin SDK por primera vez...");
  adminApp = initializeApp({
    credential: cert(firebaseAdminConfig),
    storageBucket: 'websapmax.appspot.com',
  }, 'websapmax-admin');
  
  console.log('✅ Firebase Admin inicializado correctamente.');
  return adminApp;
}

// Exportamos la función para que otros módulos del servidor puedan obtener la instancia.
export { getFirebaseAdmin };
