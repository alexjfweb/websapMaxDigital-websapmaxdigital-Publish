// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

// Esta función ahora es la única responsable de la configuración y la inicialización del Admin SDK.
function getFirebaseAdmin(): App {
  // Si la app admin ya está inicializada, la devolvemos para evitar errores.
  const existingApp = getApps().find(app => app.name === 'websapmax-admin');
  if (existingApp) {
    return existingApp;
  }

  // Leer la variable de entorno que contiene el JSON completo.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    console.error("❌ ERROR CRÍTICO: La variable de entorno FIREBASE_SERVICE_ACCOUNT no está definida.");
    throw new Error("La configuración del servidor de Firebase no está completa. Revisa tus variables de entorno.");
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Inicializar la app de Firebase Admin
    const adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`, // Asegura que el storage bucket se configure correctamente.
    }, 'websapmax-admin'); // Dar un nombre único a la app de admin.
    
    console.log("✅ Firebase Admin SDK inicializado correctamente.");
    return adminApp;

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO: No se pudo parsear o usar el JSON de la cuenta de servicio de Firebase.", error.message);
    throw new Error("El JSON de la cuenta de servicio de Firebase es inválido o está mal formateado.");
  }
}

export { getFirebaseAdmin };
