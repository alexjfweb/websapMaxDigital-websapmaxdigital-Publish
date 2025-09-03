import { NextRequest, NextResponse } from 'next/server';
import { adminStorage, verifyFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar que la configuración de Firebase Admin esté lista
    verifyFirebaseAdmin();

    // 2. Obtener el archivo del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string || 'uploads/';

    if (!file) {
      return NextResponse.json({ error: 'No se encontró ningún archivo para subir' }, { status: 400 });
    }
    
    // 3. Convertir el archivo a un Buffer para subirlo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Generar un nombre de archivo único para evitar sobreescrituras
    const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
    const fullPath = `${path}${uniqueFileName}`;

    // 5. Subir el archivo a Firebase Storage
    const bucket = adminStorage!.bucket();
    const fileRef = bucket.file(fullPath);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // 6. Hacer el archivo público para poder acceder a él a través de una URL
    await fileRef.makePublic();

    // 7. Devolver la URL pública del archivo
    const publicUrl = fileRef.publicUrl();

    return NextResponse.json({ url: publicUrl }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error en la API de subida /api/upload:', error);
    // Devolver un error más detallado para facilitar la depuración
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al subir el archivo.', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
