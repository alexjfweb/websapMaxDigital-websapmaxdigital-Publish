// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

// --- Configuración del Servidor/Admin (Privada) ---
const buildAdminConfig = () => {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      return {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      };
    } else {
        console.warn("⚠️  Advertencia: Faltan variables de entorno para Firebase Admin. Algunas funciones del backend pueden no funcionar.");
        return null;
    }
  } catch (error) {
      console.error("❌ Error al construir la configuración de Firebase Admin:", error);
      return null;
  }
};

const firebaseAdminConfig = buildAdminConfig();

let adminApp: App;

function getFirebaseAdmin(): App {
  if (getApps().some(app => app.name === 'websapmax-admin')) {
    return getApps().find(app => app.name === 'websapmax-admin')!;
  }

  if (!firebaseAdminConfig) {
    throw new Error("La configuración del servidor de Firebase no está completa. Revisa tus variables de entorno.");
  }

  adminApp = initializeApp({
    credential: cert(firebaseAdminConfig),
    storageBucket: 'websapmax.appspot.com',
  }, 'websapmax-admin');
  
  return adminApp;
}

export { getFirebaseAdmin };
