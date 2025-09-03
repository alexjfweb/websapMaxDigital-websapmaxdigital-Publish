
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';

export async function POST(request: NextRequest) {
  console.log('🚀 API /api/upload iniciada');

  try {
    // 1. Inicializar Firebase Admin
    const adminApp = getFirebaseAdmin();
    console.log('✅ Firebase Admin SDK inicializado para el proyecto:', adminApp.name);

    // 2. Obtener archivo del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || 'uploads';
    
    if (!file) {
      console.error('❌ No se encontró ningún archivo en la solicitud.');
      return NextResponse.json({ success: false, error: 'No se encontró ningún archivo.' }, { status: 400 });
    }

    console.log(`📁 Archivo recibido: ${file.name}, Tamaño: ${file.size}, Ruta: ${path}`);

    // 3. Subir archivo a Firebase Storage
    const storage = getStorage(adminApp);
    const bucket = storage.bucket();
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${path}/${timestamp}-${sanitizedFileName}`;
    const fileRef = bucket.file(fileName);

    console.log(`📤 Subiendo a Storage en la ruta: ${fileName}`);
    await fileRef.save(buffer, {
      metadata: { contentType: file.type }
    });

    // 4. Hacer público el archivo y obtener la URL
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log('✅ Subida exitosa. URL pública:', publicUrl);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    });

  } catch (error: any) {
    console.error('❌ Error catastrófico en /api/upload:', error);
    // Devuelve un error más detallado para depuración
    return NextResponse.json({ 
      success: false,
      error: 'Error interno del servidor al subir el archivo.',
      details: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
