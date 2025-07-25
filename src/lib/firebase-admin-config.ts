// src/lib/firebase-admin-config.ts
import { ServiceAccount } from 'firebase-admin';

// Lee las credenciales de las variables de entorno.
// Estas variables deben estar configuradas en tu entorno de despliegue.
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Las claves privadas deben manejarse con cuidado.
  // Reemplaza los saltos de línea literales '\\n' con saltos de línea reales.
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

const missing = Object.entries(serviceAccount)
  .filter(([, v]) => !v)
  .map(([k]) => k);

// Valida que todas las variables necesarias estén presentes.
if (missing.length) {
  const errorMessage = `❌ Faltan las siguientes variables de entorno para Firebase Admin: ${missing.join(', ')}`;
  console.error(errorMessage);
  // En un entorno de producción, podrías querer lanzar un error para detener el despliegue.
  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMessage);
  }
}

export const adminFirebaseConfig = {
  credential: serviceAccount,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
};
