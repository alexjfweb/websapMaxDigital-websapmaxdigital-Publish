
// src/lib/firebase-config.ts
// Configuración de Firebase para obtener las credenciales desde las variables de entorno.

/**
 * Obtiene la configuración de Firebase a partir de las variables de entorno.
 * Es crucial que el archivo .env.local esté correctamente configurado.
 * @returns El objeto de configuración de Firebase, o null si faltan variables.
 */
export const getFirebaseConfig = () => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Validar que todas las variables necesarias estén presentes
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.warn(`🟡 Firebase: Faltan las siguientes variables de entorno en tu archivo .env.local: ${missingKeys.join(', ')}.`);
    console.warn('   - La aplicación continuará, pero las funciones de Firebase no estarán disponibles.');
    console.warn('   - Por favor, copia .env.example a .env.local y rellena las credenciales.');
    return null; // Devolver null para indicar que la configuración está incompleta
  }
  
  return firebaseConfig;
};
