
// # ============================ #
// # 🚫 NO MODIFICAR ESTE ARCHIVO
// # 🔒 CREDENCIALES DE CLIENTE FIREBASE
// # ✅ CONFIGURACIÓN VALIDADA Y FUNCIONAL
// # ============================ #

// src/lib/firebase-config.ts

// Configuración de Firebase para el cliente (es segura para exponer en el navegador)
export const firebaseConfig = {
    apiKey: "AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg",
    authDomain: "websapmax.firebaseapp.com",
    projectId: "websapmax",
    storageBucket: "websapmax.appspot.com",
    messagingSenderId: "560613070255",
    appId: "1:560613070255:web:7ce75870dbe6b19a084b5a",
    measurementId: "G-DD5JWPV701"
};

// VALIDACIÓN: Asegura que todas las claves necesarias para la configuración de Firebase estén presentes.
export const isFirebaseConfigValid = () => {
    const missingKeys = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value && key !== 'measurementId') // measurementId es opcional
        .map(([key]) => key);

    if (missingKeys.length > 0) {
        console.error("❌ Error Crítico de Configuración de Firebase: Faltan las siguientes claves en el objeto firebaseConfig:");
        missingKeys.forEach(key => console.error(`   - ${key}`));
        console.error("Por favor, verifica el objeto de configuración en src/lib/firebase-config.ts.");
        return false;
    }
    return true;
};
