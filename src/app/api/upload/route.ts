// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminStorage, BUCKET_NAME } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No se encontró ningún archivo' }, { status: 400 });
    }

    if (!path) {
      return NextResponse.json({ error: 'La ruta de destino es requerida' }, { status: 400 });
    }

    // Convertir el archivo a un Buffer para subirlo con el Admin SDK
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear una referencia en el bucket de Firebase Storage
    const bucket = adminStorage.bucket(BUCKET_NAME);
    const sanitizedFileName = file.name.replace(/[^a-z0-9._-]/gi, '_');
    const fullPath = `${path}${Date.now()}-${sanitizedFileName}`;
    const fileUpload = bucket.file(fullPath);

    // Subir el buffer al bucket
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Hacer el archivo público para obtener una URL de descarga predecible
    await fileUpload.makePublic();

    // Devolver la URL pública
    const publicUrl = fileUpload.publicUrl();
    
    console.log(`✅ Archivo subido a GCS: ${publicUrl}`);

    return NextResponse.json({ url: publicUrl }, { status: 200 });

  } catch (error) {
    console.error('❌ Error en el endpoint de subida:', error);
    return NextResponse.json({ error: 'Error interno del servidor al subir el archivo.' }, { status: 500 });
  }
}
