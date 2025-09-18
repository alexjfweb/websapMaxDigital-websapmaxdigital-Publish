// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdmin } from '@/lib/firebase-admin'; // Importar el inicializador centralizado del servidor

export async function POST(request: NextRequest) {
  try {
    // 1. Inicializar el SDK de Admin del lado del servidor.
    // getFirebaseAdmin() se encargará de verificar las credenciales.
    const adminApp = getFirebaseAdmin();
    const storage = getStorage(adminApp);
    const bucket = storage.bucket();

    // 2. Procesar los datos del formulario.
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || 'uploads';
    
    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: 'No se encontró archivo en la solicitud' 
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 3. Crear un nombre de archivo único para evitar colisiones.
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${path}/${timestamp}-${sanitizedFileName}`;
    
    const fileRef = bucket.file(fileName);

    // 4. Subir el archivo a Firebase Storage.
    await fileRef.save(buffer, {
      metadata: { 
        contentType: file.type,
      }
    });

    // 5. Hacer el archivo público para que se pueda visualizar.
    await fileRef.makePublic();

    // 6. Devolver la URL pública del archivo.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
    });

  } catch (error: any) {
    // Si algo falla (especialmente la inicialización de Firebase Admin),
    // el error se capturará aquí y se devolverá una respuesta 500.
    console.error('❌ Error en la API de subida:', error);
    return NextResponse.json({ 
      success: false,
      error: `Error interno del servidor: ${error.message}`,
    }, { status: 500 });
  }
}
