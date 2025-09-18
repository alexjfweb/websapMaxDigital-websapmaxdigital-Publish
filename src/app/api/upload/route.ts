// src/app/api/upload/route.ts - VERSIÓN CORREGIDA Y ROBUSTA
import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdmin } from '@/lib/firebase-admin'; // Importar el inicializador centralizado

export async function POST(request: NextRequest) {
  try {
    const adminApp = getFirebaseAdmin();
    const storage = getStorage(adminApp);
    const bucket = storage.bucket();

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
    
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${path}/${timestamp}-${sanitizedFileName}`;
    
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: { 
        contentType: file.type,
      }
    });

    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
    });

  } catch (error: any) {
    console.error('❌ Error en la API de subida:', error);
    return NextResponse.json({ 
      success: false,
      error: `Error interno del servidor: ${error.message}`,
    }, { status: 500 });
  }
}
