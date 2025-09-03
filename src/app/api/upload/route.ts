// src/app/api/upload/route.ts - Versión mínima para debugging
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 === API UPLOAD INICIADA ===');
  console.log('⏰ Timestamp:', new Date().toISOString());

  try {
    // Paso 1: Verificar que podemos obtener FormData
    console.log('1️⃣ Obteniendo FormData...');
    let formData;
    try {
      formData = await request.formData();
      console.log('✅ FormData obtenido');
    } catch (error: any) {
      console.error('❌ Error con FormData:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al procesar FormData',
        step: 'formdata',
        details: error.message
      }, { status: 400 });
    }

    // Paso 2: Verificar que hay archivo
    console.log('2️⃣ Extrayendo archivo...');
    const file = formData.get('file') as File;
    if (!file) {
      console.error('❌ No hay archivo');
      return NextResponse.json({
        success: false,
        error: 'No se encontró archivo',
        step: 'file_check'
      }, { status: 400 });
    }

    console.log('✅ Archivo encontrado:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Paso 3: Verificar variables de entorno
    console.log('3️⃣ Verificando variables de entorno...');
    const hasServiceKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
    const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;

    console.log('🔍 Variables disponibles:', {
      hasServiceKey,
      hasProjectId,
      hasClientEmail,
      hasPrivateKey,
      nodeEnv: process.env.NODE_ENV
    });

    if (!hasServiceKey && !(hasProjectId && hasClientEmail && hasPrivateKey)) {
      console.error('❌ Variables de entorno faltantes');
      return NextResponse.json({
        success: false,
        error: 'Variables de entorno de Firebase no configuradas',
        step: 'env_vars',
        available: { hasServiceKey, hasProjectId, hasClientEmail, hasPrivateKey }
      }, { status: 500 });
    }

    // Paso 4: Probar importación de Firebase
    console.log('4️⃣ Importando Firebase Admin...');
    let firebaseAdmin;
    try {
      firebaseAdmin = await import('firebase-admin/app');
      console.log('✅ Firebase Admin importado');
    } catch (error: any) {
      console.error('❌ Error importando Firebase:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al importar Firebase Admin',
        step: 'firebase_import',
        details: error.message
      }, { status: 500 });
    }

    // Paso 5: Preparar credenciales
    console.log('5️⃣ Preparando credenciales...');
    let credentials;
    try {
      if (hasServiceKey) {
        credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
        console.log('✅ Credenciales desde SERVICE_ACCOUNT_KEY');
      } else {
        credentials = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        };
        console.log('✅ Credenciales desde variables separadas');
      }

      console.log('📊 Credenciales preparadas:', {
        projectId: credentials.projectId || credentials.project_id,
        clientEmail: credentials.clientEmail || credentials.client_email,
        hasPrivateKey: !!(credentials.privateKey || credentials.private_key)
      });

    } catch (error: any) {
      console.error('❌ Error preparando credenciales:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al parsear credenciales',
        step: 'credentials',
        details: error.message
      }, { status: 500 });
    }

    // Paso 6: Inicializar Firebase
    console.log('6️⃣ Inicializando Firebase...');
    let app;
    try {
      const { getApps, initializeApp, cert } = firebaseAdmin;
      
      if (getApps().length === 0) {
        app = initializeApp({
          credential: cert(credentials),
          storageBucket: `${credentials.projectId || credentials.project_id}.appspot.com`
        });
        console.log('✅ Firebase inicializado');
      } else {
        app = getApps()[0];
        console.log('✅ Firebase ya inicializado');
      }
    } catch (error: any) {
      console.error('❌ Error inicializando Firebase:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al inicializar Firebase',
        step: 'firebase_init',
        details: error.message
      }, { status: 500 });
    }

    // Paso 7: Obtener Storage
    console.log('7️⃣ Obteniendo Storage...');
    let storage, bucket;
    try {
      const { getStorage } = await import('firebase-admin/storage');
      storage = getStorage(app);
      bucket = storage.bucket();
      console.log('✅ Storage obtenido:', bucket.name);
    } catch (error: any) {
      console.error('❌ Error obteniendo Storage:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al obtener Storage',
        step: 'storage',
        details: error.message
      }, { status: 500 });
    }

    // Paso 8: Procesar y subir archivo
    console.log('8️⃣ Subiendo archivo...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const timestamp = Date.now();
      const fileName = `test-uploads/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const fileRef = bucket.file(fileName);

      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });

      // Hacer público
      await fileRef.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      console.log('✅ ¡UPLOAD EXITOSO!', publicUrl);
      
      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        message: 'Archivo subido exitosamente'
      });

    } catch (error: any) {
      console.error('❌ Error subiendo archivo:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al subir archivo',
        step: 'upload',
        details: error.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ ERROR GENERAL:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      step: 'general',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
