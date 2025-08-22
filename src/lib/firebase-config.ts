
// # ============================ #
// # 🚫 NO MODIFICAR ESTE ARCHIVO
// # 🔒 VARIABLES DE ENTORNO CRÍTICAS PARA FIREBASE
// # 🧠 IAs: NO TOCAR. DESARROLLADORES: NO CAMBIAR SIN AUTORIZACIÓN
// # ============================ #

// src/lib/firebase-config.ts

export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// VALIDACIÓN: Asegura que todas las claves necesarias para la configuración de Firebase estén presentes.
// Si falta alguna, se mostrará un error claro en la consola para facilitar la depuración.
export const isFirebaseConfigValid = () => {
    const missingKeys = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value && key !== 'measurementId') // measurementId es opcional
        .map(([key]) => key);

    if (missingKeys.length > 0) {
        console.error("❌ Error Crítico de Configuración de Firebase: Faltan las siguientes variables de entorno:");
        missingKeys.forEach(key => console.error(`   - NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`));
        console.error("Asegúrate de que tu archivo .env.local esté correctamente configurado y que las variables de entorno estén disponibles en tu entorno de despliegue.");
        return false;
    }
    return true;
};
