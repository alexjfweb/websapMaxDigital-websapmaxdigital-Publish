// src/lib/firebase-config.ts
// Configuración de Firebase para desarrollo y producción

export const firebaseConfig = {
  // Configuración de producción (reemplaza con tus credenciales reales)
  production: {
    apiKey: "AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg",
    authDomain: "websapmax.firebaseapp.com",
    projectId: "websapmax",
    storageBucket: "websapmax.appspot.com",
    messagingSenderId: "560613070255",
    appId: "1:560613070255:web:7ce75870dbe6b19a084b5a",
    measurementId: "G-DD5JWPV701"
  },
  
  // Configuración de desarrollo (fallback)
  development: {
    apiKey: "AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg",
    authDomain: "websapmax.firebaseapp.com",
    projectId: "websapmax",
    storageBucket: "websapmax.appspot.com",
    messagingSenderId: "560613070255",
    appId: "1:560613070255:web:7ce75870dbe6b19a084b5a",
    measurementId: "G-DD5JWPV701"
  }
};

// Función para obtener la configuración correcta
export const getFirebaseConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const config = isProduction ? firebaseConfig.production : firebaseConfig.development;
  
  // Verificar si las variables de entorno están configuradas
  const hasEnvVars = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (hasEnvVars) {
    console.log('✅ Firebase: Usando configuración de variables de entorno');
    // Si usas .env.local, asegúrate que las variables coincidan
    return {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
  } else {
    console.log('⚠️ Firebase: Usando configuración de desarrollo desde firebase-config.ts');
    return firebaseConfig.development;
  }
};
