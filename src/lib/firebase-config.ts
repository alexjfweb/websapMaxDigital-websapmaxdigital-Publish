
// src/lib/firebase-config.ts

// --- Configuración del Cliente (Pública y Segura) ---
// Esta configuración es segura para exponer en el frontend.
export const firebaseConfig = {
    apiKey: "AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg",
    authDomain: "websapmax.firebaseapp.com",
    projectId: "websapmax",
    storageBucket: "websapmax.appspot.com", // Se mantiene el formato .appspot.com que es el estándar para el SDK de Admin
    messagingSenderId: "560613070255",
    appId: "1:560613070255:web:7ce75870dbe6b19a084b5a",
    measurementId: "G-DD5JWPV701"
};

// --- Configuración del Servidor/Admin (Privada) ---
// Se construye a partir de variables de entorno para no exponer secretos en el código.
let adminConfig: any;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        adminConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
            console.warn("⚠️  Advertencia: Faltan variables de entorno para Firebase Admin. Algunas funciones del backend pueden no funcionar.");
            adminConfig = {};
        } else {
            adminConfig = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
            };
        }
    }
} catch (error) {
    console.error("❌ Error al parsear FIREBASE_SERVICE_ACCOUNT:", error);
    adminConfig = {};
}

export const firebaseAdminConfig = adminConfig;

// VALIDACIÓN: Asegura que las claves públicas de Firebase estén presentes.
export const isFirebaseConfigValid = () => {
    const missingKeys = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value && key !== 'measurementId')
        .map(([key]) => key);

    if (missingKeys.length > 0) {
        console.error("❌ Error Crítico: Faltan las siguientes claves públicas de Firebase. Revisa tus variables de entorno (NEXT_PUBLIC_...):");
        missingKeys.forEach(key => console.error(`   - ${key}`));
        return false;
    }
    return true;
};
