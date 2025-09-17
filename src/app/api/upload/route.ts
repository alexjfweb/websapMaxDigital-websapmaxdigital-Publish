// src/app/api/upload/route.ts - VERSIÓN CORREGIDA Y ROBUSTA
import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdmin } from '@/lib/firebase-admin'; // Importar el inicializador centralizado

export async function POST(request: NextRequest) {
  let adminApp;
  try {
    // Obtiene la instancia inicializada de forma centralizada.
    // Esto resuelve el error "El servidor de Firebase no está inicializado".
    adminApp = getFirebaseAdmin();
  } catch (error: any) {
    console.error('❌ Error fatal al obtener la instancia de Firebase Admin:', error);
    return NextResponse.json({ 
        success: false,
        error: `Fallo en la configuración del servidor de Firebase: ${error.message}`
      }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || 'uploads';
    
    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: 'No se encontró archivo en la solicitud' 
      }, { status: 400 });
    }

    const storage = getStorage(adminApp);
    const bucket = storage.bucket(); // El bucket se obtiene de la inicialización

    // Verificación de existencia del Bucket (buena práctica)
    try {
      const [exists] = await bucket.exists();
      if (!exists) {
        const errorMsg = `El bucket de almacenamiento "${bucket.name}" no existe. Asegúrate de que Firebase Storage esté habilitado en tu proyecto.`;
        console.error(`❌ ${errorMsg}`);
        throw new Error(`Configuración de Storage incorrecta. Activa Firebase Storage en la consola.`);
      }
    } catch (e: any) {
      throw new Error(`Error al verificar el bucket: ${e.message}`);
    }

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

    // Hacer el archivo público para que pueda ser visto
    await fileRef.makePublic();

    // Construir la URL pública correctamente
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log('🎉 Upload completado. URL pública:', publicUrl);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
    });

  } catch (error: any) {
    console.error('❌ Error en la API de subida:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Error interno del servidor al subir el archivo.',
    }, { status: 500 });
  }
}
