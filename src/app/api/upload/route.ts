// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseStorage, verifyFirebaseConfig } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  console.log('🚀 API Upload iniciada...');
  const startTime = Date.now();

  try {
    // 1. Verificar configuración de Firebase
    console.log('1️⃣ Verificando configuración de Firebase...');
    const configCheck = verifyFirebaseConfig();
    
    if (!configCheck.isValid) {
      console.error('❌ Configuración de Firebase inválida:', configCheck.error);
      return NextResponse.json({
        success: false,
        error: 'Configuración de Firebase no disponible',
        details: configCheck.error,
        step: 'firebase_config_check'
      }, { status: 500 });
    }

    console.log('✅ Firebase configurado correctamente:', {
      projectId: configCheck.projectId,
      clientEmail: configCheck.clientEmail?.substring(0, 20) + '...'
    });

    // 2. Obtener archivo del FormData
    console.log('2️⃣ Extrayendo archivo del FormData...');
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('❌ Error al parsear FormData:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al procesar FormData',
        details: error.message,
        step: 'formdata_parsing'
      }, { status: 400 });
    }

    const file = formData.get('file') as File;
    if (!file) {
      console.error('❌ No se encontró archivo en FormData');
      return NextResponse.json({
        success: false,
        error: 'No se encontró ningún archivo',
        step: 'file_extraction'
      }, { status: 400 });
    }

    console.log('✅ Archivo extraído:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // 3. Validar archivo
    if (file.size > 10 * 1024 * 1024) { // 10MB máximo
      console.error('❌ Archivo muy grande:', file.size);
      return NextResponse.json({
        success: false,
        error: 'El archivo es muy grande (máximo 10MB)',
        step: 'file_validation'
      }, { status: 400 });
    }

    // 4. Convertir archivo a buffer
    console.log('3️⃣ Convirtiendo archivo a buffer...');
    let buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log('✅ Buffer creado:', buffer.length, 'bytes');
    } catch (error) {
      console.error('❌ Error al convertir a buffer:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al procesar el archivo',
        details: error.message,
        step: 'buffer_conversion'
      }, { status: 500 });
    }

    // 5. Preparar Storage
    console.log('4️⃣ Obteniendo referencia de Storage...');
    let storage, bucket, fileRef;
    try {
      storage = getFirebaseStorage();
      bucket = storage.bucket();
      
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `uploads/${timestamp}-${sanitizedFileName}`;
      
      fileRef = bucket.file(fileName);
      console.log('✅ Referencias creadas:', {
        bucketName: bucket.name,
        fileName: fileName
      });
    } catch (error) {
      console.error('❌ Error al configurar Storage:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al configurar Firebase Storage',
        details: error.message,
        step: 'storage_setup'
      }, { status: 500 });
    }

    // 6. Subir archivo
    console.log('5️⃣ Subiendo archivo a Firebase Storage...');
    try {
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        },
      });
      console.log('✅ Archivo guardado en Storage');
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al subir archivo a Storage',
        details: error.message,
        step: 'file_upload'
      }, { status: 500 });
    }

    // 7. Hacer público el archivo
    console.log('6️⃣ Haciendo archivo público...');
    try {
      await fileRef.makePublic();
      console.log('✅ Archivo hecho público');
    } catch (error) {
      console.error('⚠️  Advertencia al hacer público:', error);
      // No es crítico, continúamos
    }

    // 8. Generar URL
    const fileName = fileRef.name;
    const bucketName = bucket.name;
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    const duration = Date.now() - startTime;
    console.log(`✅ Upload completado en ${duration}ms:`, publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      metadata: {
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadDuration: duration
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error general en API Upload (${duration}ms):`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message,
      step: 'general_error',
      duration: duration,
      // Solo en desarrollo
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack 
      })
    }, { status: 500 });
  }
}
