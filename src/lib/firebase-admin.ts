// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, ServiceAccount, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App | null = null;

// Función para obtener credenciales con mejor manejo de errores
function getServiceAccountCredentials(): ServiceAccount {
  console.log('🔍 Obteniendo credenciales de Firebase...');
  
  // Método 1: Variables separadas (MÉTODO PREFERIDO Y MÁS CONFIABLE)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    console.log('📝 Usando variables de entorno separadas');
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    console.log('✅ Variables de entorno separadas encontradas');
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    } as ServiceAccount;
  }
  
  // Método 2: JSON completo en variable de entorno (Fallback)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      console.log('📝 Usando FIREBASE_SERVICE_ACCOUNT_KEY como fallback');
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      console.log('✅ Service account JSON parseado correctamente');
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
      } as ServiceAccount;
    } catch (error: any) {
      console.error('❌ Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY:', error);
      throw new Error(`Error al parsear las credenciales JSON: ${error.message}`);
    }
  }
  
  // Si llegamos aquí, no hay credenciales válidas
  const availableVars = {
    FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
  };
  
  console.error('❌ Variables de entorno disponibles:', availableVars);
  throw new Error('No se encontraron credenciales válidas de Firebase. Verifica tu archivo .env.local');
}

// Función para inicializar Firebase Admin de manera segura
function initializeFirebaseAdmin(): App {
  try {
    // Si ya existe una app, la devolvemos
    const existingApps = getApps();
    if (existingApps.length > 0) {
      console.log('♻️  Reutilizando instancia existente de Firebase Admin');
      return existingApps[0];
    }

    console.log('🚀 Inicializando nueva instancia de Firebase Admin...');
    const credentials = getServiceAccountCredentials();
    
    const app = initializeApp({
      credential: cert(credentials),
      storageBucket: 'websapmax.appspot.com'
    });

    console.log('✅ Firebase Admin inicializado exitosamente');
    console.log(`📊 Proyecto: ${credentials.projectId}`);
    console.log(`📧 Service Account: ${credentials.clientEmail}`);
    
    return app;
  } catch (error: any) {
    console.error('❌ Error crítico al inicializar Firebase Admin:', error);
    throw error;
  }
}

// Función para obtener la instancia de Firebase Admin
export function getFirebaseAdmin(): App {
  if (!adminApp) {
    adminApp = initializeFirebaseAdmin();
  }
  return adminApp;
}

// Función para obtener el Storage
export function getFirebaseStorage() {
  try {
    const app = getFirebaseAdmin();
    const storage = getStorage(app);
    console.log('✅ Storage obtenido correctamente');
    return storage;
  } catch (error: any) {
    console.error('❌ Error al obtener Firebase Storage:', error);
    throw error;
  }
}

// Función de verificación para debugging
export function verifyFirebaseConfig() {
  try {
    const credentials = getServiceAccountCredentials();
    const app = getFirebaseAdmin();
    
    return {
      isValid: true,
      projectId: credentials.projectId,
      clientEmail: credentials.clientEmail,
      appName: app.name,
      hasStorage: true
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

// Exportar directamente para compatibilidad
export const adminStorage = {
  bucket: () => {
    const storage = getFirebaseStorage();
    return storage.bucket();
  }
};