// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

// Esta función es la única responsable de la configuración y la inicialización del Admin SDK.
function getFirebaseAdmin(): App {
  if (getApps().some(app => app.name === 'websapmax-admin')) {
    return getApps().find(app => app.name === 'websapmax-admin')!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ ERROR CRÍTICO: Las variables de entorno FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, o FIREBASE_PRIVATE_KEY no están definidas.");
    throw new Error("La configuración del servidor de Firebase no está completa. Revisa tus variables de entorno.");
  }
  
  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: `${projectId}.appspot.com`,
    }, 'websapmax-admin');
    
    console.log("✅ Firebase Admin SDK inicializado correctamente.");
    return adminApp;

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO: No se pudo inicializar Firebase Admin.", error.message);
    throw new Error("Las credenciales de Firebase Admin son inválidas o están mal formateadas.");
  }
}

export { getFirebaseAdmin };
