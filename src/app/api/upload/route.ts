// src/app/api/upload/route.ts - VERSIÓN CORREGIDA Y ROBUSTA
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { firebaseAdminConfig } from '@/lib/firebase-config';

// Inicialización de Firebase Admin fuera del handler para reutilizar la instancia
let adminApp;
if (!getApps().length) {
  try {
    adminApp = initializeApp({
      credential: cert(firebaseAdminConfig),
      // CORRECCIÓN CLAVE: Usar el formato .appspot.com para el bucket de admin
      storageBucket: 'websapmax.appspot.com',
    });
    console.log('✅ Firebase Admin SDK inicializado correctamente.');
  } catch (error) {
    console.error('❌ Error crítico al inicializar Firebase Admin SDK:', error);
  }
} else {
  adminApp = getApps()[0];
}


export async function POST(request: NextRequest) {
  if (!adminApp) {
    return NextResponse.json({ 
        success: false,
        error: 'El servidor de Firebase no está inicializado. Revisa las credenciales del servidor.' 
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
    const bucket = storage.bucket();

    // Verificación de existencia del Bucket
    try {
      const [exists] = await bucket.exists();
      if (!exists) {
        console.error(`❌ El bucket "${bucket.name}" no existe o no se puede acceder a él.`);
        throw new Error(`El bucket de almacenamiento no existe. Actívalo en la consola de Firebase.`);
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

    // CORRECCIÓN CLAVE: Hacer el archivo público y generar la URL correcta
    await fileRef.makePublic();
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
