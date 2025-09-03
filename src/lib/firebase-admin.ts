import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Función para obtener las credenciales
function getServiceAccountCredentials(): ServiceAccount {
  // Método 1: Si tienes el JSON completo en una sola línea
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      // Reemplazamos \\n por \n para asegurar que los saltos de línea en la clave privada sean correctos
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n');
      return JSON.parse(serviceAccountJson);
    } catch (error) {
      console.error('Error al parsear FIREBASE_SERVICE_ACCOUNT:', error);
      // Continuar para probar el método 2
    }
  }
  
  // Método 2: Variables separadas (más confiable)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    } as ServiceAccount;
  }
  
  throw new Error('No se encontraron las credenciales de Firebase Admin. Verifica tus variables de entorno.');
}

// Inicializar Firebase Admin
let adminApp;
if (getApps().length === 0) {
  try {
    const credentials = getServiceAccountCredentials();
    adminApp = initializeApp({
      credential: cert(credentials),
      storageBucket: `${credentials.projectId}.appspot.com`
    });
    console.log('✅ Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('❌ Error fatal al inicializar Firebase Admin. La aplicación no podrá funcionar correctamente sin esto.', error);
    // En un entorno de producción, podrías querer que la aplicación no se inicie si esto falla.
  }
} else {
  adminApp = getApps()[0];
}

// Exportar servicios solo si la inicialización fue exitosa
export const adminStorage = adminApp ? getStorage(adminApp) : null;
export { adminApp };

// Función de verificación para usar en los endpoints
export function verifyFirebaseAdmin() {
  if (!adminApp || !adminStorage) {
    throw new Error('La configuración del servicio de Firebase Admin no está disponible. Revisa los logs del servidor para más detalles.');
  }
}
