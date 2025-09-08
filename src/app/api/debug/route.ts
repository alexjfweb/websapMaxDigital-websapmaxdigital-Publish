// src/app/api/debug/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 API Debug iniciada');
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    platform: process.platform,
    
    // Variables de entorno (sin valores sensibles)
    environmentVariables: {
      FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      
      // Longitudes para debug
      firebaseKeyLength: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0,
      projectIdValue: process.env.FIREBASE_PROJECT_ID || 'NOT_SET',
      clientEmailValue: process.env.FIREBASE_CLIENT_EMAIL || 'NOT_SET',
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
    },
    
    // Test de Firebase
    firebaseTest: {
      canImportFirebase: false,
      existingApps: 0,
      initializationTest: 'not_attempted'
    } as any
  };

  // Probar Firebase
  try {
    console.log('🧪 Probando importación de Firebase Admin...');
    
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    console.log('✅ Firebase admin importado');
    
    debugInfo.firebaseTest = {
      canImportFirebase: true,
      existingApps: getApps().length,
      initializationTest: 'not_attempted'
    };

    // Intentar inicialización
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
        (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)) {
      
      console.log('🚀 Intentando inicialización...');
      
      let credentials;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } else {
        credentials = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        };
      }

      if (getApps().length === 0) {
        const app = initializeApp({
          credential: cert(credentials),
          storageBucket: `${credentials.projectId || credentials.project_id}.appspot.com`
        });
        
        debugInfo.firebaseTest.initializationTest = 'success';
        debugInfo.firebaseTest.appName = app.name;
        console.log('✅ Firebase inicializado en debug');
      } else {
        debugInfo.firebaseTest.initializationTest = 'already_initialized';
      }
    } else {
      debugInfo.firebaseTest.initializationTest = 'no_credentials';
    }

  } catch (error: any) {
    console.error('❌ Error en test de Firebase:', error);
    debugInfo.firebaseTest = {
      canImportFirebase: false,
      error: error.message,
      stack: error.stack
    };
  }

  console.log('📋 Debug info generada:', debugInfo);
  return NextResponse.json(debugInfo);
}
