
import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Cargar las variables de entorno
dotenv.config();

// Esto solo se ejecutará en el entorno del servidor (backend)
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccount: any;

if (serviceAccountString) {
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    console.error("Error al parsear FIREBASE_SERVICE_ACCOUNT:", e);
    serviceAccount = null;
  }
} else {
  console.error("La variable de entorno FIREBASE_SERVICE_ACCOUNT no está definida.");
}

// Inicializa la app de admin de Firebase si no se ha hecho antes.
if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: 'websapmax.appspot.com'
        });
        console.log('✅ Firebase Admin SDK inicializado correctamente.');
    } else {
        console.error('❌ No se pudo inicializar Firebase Admin SDK: las credenciales no están disponibles.');
    }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminStorage = admin.apps.length ? admin.storage() : null;
