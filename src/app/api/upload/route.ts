
import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';

const storage = getStorage(app);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo.' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `uploads/${fileName}`);

    const fileBuffer = await file.arrayBuffer();
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
        contentType: file.type,
    });
    
    const downloadURL = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ url: downloadURL }, { status: 200 });
  } catch (error: any) {
    console.error('Error en el proxy de subida:', error);
    // Proporcionar un mensaje de error más específico si es posible
    let errorMessage = 'Error al subir el archivo.';
    if (error.code?.includes('storage/unauthorized')) {
        errorMessage = 'Permiso denegado. Revisa la configuración de CORS y las reglas de seguridad de Storage.';
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
