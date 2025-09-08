// src/app/api/test-config/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 Iniciando diagnóstico de configuración...');
  
  // Verificar todas las variables de entorno
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
  };

  console.log('📊 Variables de entorno:', envVars);

  let firebaseTest = {
    canParseServiceAccount: false,
    canInitializeAdmin: false,
    error: null,
    details: {}
  };

  try {
    // Probar parsing del service account
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      firebaseTest.canParseServiceAccount = true;
      firebaseTest.details = {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        hasPrivateKey: !!parsed.private_key
      };
      console.log('✅ Service account parseado correctamente');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      firebaseTest.canParseServiceAccount = true;
      firebaseTest.details = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
      };
      console.log('✅ Variables separadas detectadas');
    }

    // Probar inicialización de Firebase Admin
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    
    if (getApps().length === 0) {
      let credentials;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } else {
        credentials = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };
      }

      const app = initializeApp({
        credential: cert(credentials),
        storageBucket: `${credentials.projectId || credentials.project_id}.appspot.com`
      });
      
      firebaseTest.canInitializeAdmin = true;
      console.log('✅ Firebase Admin inicializado correctamente');
    } else {
      firebaseTest.canInitializeAdmin = true;
      console.log('✅ Firebase Admin ya estaba inicializado');
    }

  } catch (error) {
    firebaseTest.error = error.message;
    firebaseTest.canInitializeAdmin = false;
    console.error('❌ Error en diagnóstico:', error);
  }

  const result = {
    timestamp: new Date().toISOString(),
    environment: envVars,
    firebase: firebaseTest,
    recommendation: firebaseTest.canInitializeAdmin 
      ? "✅ Firebase configurado correctamente" 
      : "❌ Revisar configuración de Firebase"
  };

  console.log('📋 Resultado del diagnóstico:', result);
  
  return NextResponse.json(result, { status: 200 });
}
