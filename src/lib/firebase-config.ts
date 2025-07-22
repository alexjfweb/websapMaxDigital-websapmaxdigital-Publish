// src/lib/firebase-config.ts
// Configuración de Firebase para desarrollo y producción

export const firebaseConfig = {
  // Configuración de producción (reemplaza con tus credenciales reales)
  production: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'websapmaxdigital-demo.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'websapmaxdigital-demo',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'websapmaxdigital-demo.appspot.com',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
  },
  
  // Configuración de desarrollo (fallback)
  development: {
    apiKey: 'AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg',
    authDomain: 'websapmaxdigital-demo.firebaseapp.com',
    projectId: 'websapmaxdigital-demo',
    storageBucket: 'websapmaxdigital-demo.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abcdef1234567890',
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