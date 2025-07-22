// src/lib/firebase-config.ts
// Configuración de Firebase para desarrollo y producción

export const firebaseConfig = {
  // Configuración de producción (reemplaza con tus credenciales reales)
  production: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'BB7zCrAz2u0wJBGuhAAVuoSk6Hx3lYv8dTGweV8TD_7oHCYhj56iKGxfogwuLiMREVq3PMLRnOIQU8Fma4Gt2YA',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'websapmaxdigital.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'websapmaxdigital',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'websapmaxdigital.appspot.com',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1069538883515',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1069538883515:web:a2b165b485292444747b2c',
  },
  
  // Configuración de desarrollo (fallback)
  development: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'BB7zCrAz2u0wJBGuhAAVuoSk6Hx3lYv8dTGweV8TD_7oHCYhj56iKGxfogwuLiMREVq3PMLRnOIQU8Fma4Gt2YA',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'websapmaxdigital.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'websapmaxdigital',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'websapmaxdigital.appspot.com',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1069538883515',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1069538883515:web:a2b165b485292444747b2c',
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
    return firebaseConfig.production;
  } else {
    console.log('⚠️ Firebase: Usando configuración de desarrollo');
    return firebaseConfig.development;
  }
};
