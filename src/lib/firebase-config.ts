
// src/lib/firebase-config.ts

// --- Configuración del Cliente (Pública y Segura) ---
// Esta configuración es segura para exponer en el frontend.
export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC5sQ0G3f7c_1J6X5c8V4Z9b3Y7a1f2E3",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "websapmax.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "websapmax",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "websapmax.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "104506820845",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:104506820845:web:86aa3545645855f71901d8",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEFGHIJ"
};

// --- Configuración del Servidor/Admin (Privada) ---
// Se construye a partir de variables de entorno para no exponer secretos en el código.
// La variable FIREBASE_SERVICE_ACCOUNT contiene el JSON completo.
let adminConfig: any;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        adminConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        // Fallback para entornos que usan variables separadas (como Vercel)
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
            console.warn("⚠️  Advertencia: Faltan variables de entorno para Firebase Admin. Algunas funciones del backend pueden no funcionar.");
            adminConfig = {};
        } else {
            adminConfig = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
