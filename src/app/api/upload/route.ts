
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { firebaseAdminConfig } from '@/lib/firebase-config'; // Importar la config directamente

export async function POST(request: NextRequest) {
  console.log('🚀 API Upload iniciada - Versión final');

  try {
    // 1. Obtener archivo y ruta del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || 'uploads';
    
    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: 'No se encontró archivo en la solicitud' 
      }, { status: 400 });
    }

    console.log('📁 Archivo recibido:', { 
      name: file.name, 
      size: file.size, 
      type: file.type,
      path: path
    });

    // 2. Usar la configuración de firebase-admin importada
    if (!firebaseAdminConfig.project_id) {
       return NextResponse.json({
        success: false,
        error: 'La configuración de Firebase Admin está incompleta.'
      }, { status: 500 });
    }
    
    console.log('🔑 Usando proyecto:', firebaseAdminConfig.project_id);

    // 3. Inicializar Firebase Admin
    let app;
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert(firebaseAdminConfig),
        storageBucket: `${firebaseAdminConfig.project_id}.appspot.com`
      });
      console.log('✅ Firebase Admin inicializado');
    } else {
      app = getApps()[0];
      console.log('♻️ Reutilizando Firebase Admin');
    }

    // 4. Subir archivo
    const storage = getStorage(app);
    const bucket = storage.bucket();
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${path}/${timestamp}-${sanitizedFileName}`;
    
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: { 
        contentType: file.type,
      }
    });

    console.log('✅ Archivo guardado en Storage');

    // 5. Hacer público el archivo y generar URL
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log('🎉 Upload completado exitosamente:', publicUrl);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
    });

  } catch (error: any) {
    console.error('❌ Error completo en la API de subida:', error);
    
    let errorMessage = 'Error interno del servidor al subir el archivo.';
    if (error.message && error.message.includes('bucket does not exist')) {
      errorMessage = 'El bucket de Firebase Storage no existe o no está activado. Ve a Firebase Console -> Storage y actívalo.';
    } else if (error.message && error.message.includes('permission')) {
      errorMessage = 'Sin permisos para acceder a Firebase Storage. Revisa los permisos de la cuenta de servicio.';
    }

    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      details: error.message,
    }, { status: 500 });
  }
}
