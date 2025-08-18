
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminStorage, BUCKET_NAME } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No se encontró ningún archivo para subir.' }, { status: 400 });
    }

    if (!path) {
      return NextResponse.json({ error: 'La ruta de destino es requerida.' }, { status: 400 });
    }

    // Convertir el archivo a un Buffer para subirlo con el Admin SDK
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear una referencia en el bucket de Firebase Storage
    // Asegurarse de que adminStorage está disponible
    if (!adminStorage || typeof adminStorage.bucket !== 'function') {
        throw new Error("Firebase Admin Storage no está inicializado correctamente. Verifica las credenciales del servidor.");
    }
    const bucket = adminStorage.bucket(BUCKET_NAME);
    
    // CORRECCIÓN: Asegurar un nombre de archivo único para evitar colisiones
    const sanitizedFileName = file.name.replace(/[^a-z0-9._-]/gi, '_');
    const fullPath = `${path}${Date.now()}-${sanitizedFileName}`;
    
    const fileUpload = bucket.file(fullPath);

    // Subir el buffer al bucket
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
      public: true, // Hacer el archivo público directamente al subirlo
    });
    
    // Obtener la URL pública de forma más directa
    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fullPath}`;
    
    console.log(`✅ Archivo subido a GCS: ${publicUrl}`);

    return NextResponse.json({ url: publicUrl }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error en el endpoint de subida:', error);
    // Devolver un mensaje de error más específico si es posible
    const errorMessage = error.message || 'Error interno del servidor al subir el archivo.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
