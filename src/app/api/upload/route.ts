
import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase'; // Importa la instancia inicializada

const storage = getStorage(app);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo.' }, { status: 400 });
    }

    console.log(`[API/Upload] Recibido archivo: ${file.name}, Tipo: ${file.type}`);

    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `uploads/${fileName}`);

    // Convertir el archivo a un ArrayBuffer para subirlo
    const fileBuffer = await file.arrayBuffer();
    
    console.log(`[API/Upload] Subiendo a Firebase Storage en la ruta: uploads/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
        contentType: file.type,
    });
    
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log(`[API/Upload] Subida exitosa. URL: ${downloadURL}`);

    return NextResponse.json({ url: downloadURL }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error en el endpoint de subida /api/upload:', error);
    
    let errorMessage = 'Error al subir el archivo.';
    if (error.code?.includes('storage/unauthorized')) {
        errorMessage = 'Permiso denegado en Firebase Storage. Revisa las reglas de seguridad.';
    }
    
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}
