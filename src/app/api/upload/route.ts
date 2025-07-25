// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin'; // Usar Firebase Admin

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Archivo no recibido.' }, { status: 400 });
    }

    // Sanitizar el nombre del archivo para evitar errores
    const sanitizedFileName = file.name.replace(/[^a-z0-9._-]/gi, '_');
    const filePath = `uploads/${Date.now()}-${sanitizedFileName}`;

    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(filePath);

    // Convertir el archivo a un buffer para subirlo
    const buffer = Buffer.from(await file.arrayBuffer());

    // Subir el buffer al bucket
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Obtener la URL pública del archivo subido
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Una fecha de expiración muy lejana para simular una URL pública
    });

    console.log(`✅ Archivo subido exitosamente a ${filePath}. URL: ${url}`);
    return NextResponse.json({ url });

  } catch (err: any) {
    console.error('❌ Error en el endpoint /api/upload:', err);
    // Devuelve un mensaje de error más detallado
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al subir el archivo.', 
        details: err.message,
        code: err.code
      }, 
      { status: 500 }
    );
  }
}
