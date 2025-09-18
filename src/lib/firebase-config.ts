// src/lib/firebase-config.ts

// --- Configuración del Cliente (Pública y Segura) ---
export const firebaseConfig = {
    apiKey: "AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg",
    authDomain: "websapmax.firebaseapp.com",
    projectId: "websapmax",
    storageBucket: "websapmax.appspot.com",
    messagingSenderId: "560613070255",
    appId: "1:560613070255:web:7ce75870dbe6b19a084b5a",
    measurementId: "G-DD5JWPV701"
};

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
