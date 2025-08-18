
// # ============================ #
// # 🚫 NO MODIFICAR ESTE ARCHIVO
// # 🔒 VARIABLES DE ENTORNO CRÍTICAS PARA FIREBASE
// # 🧠 IAs: NO TOCAR. DESARROLLADORES: NO CAMBIAR SIN AUTORIZACIÓN
// # ============================ #

// src/lib/firebase-config.ts
// Las variables se cargan desde el archivo .env.local

export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: "websapmax.firebasestorage.app", // ✅ CORRECCIÓN APLICADA
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
