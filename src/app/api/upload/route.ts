
import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { auth } from '@/lib/firebase'; // Corregido

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se ha subido ningún archivo.' }, { status: 400 });
    }

    // Aquí podrías añadir una capa de autenticación si el endpoint es protegido
    // Por ejemplo, verificando un token de sesión.
    // const userId = "some-user-id"; // Obtener de la sesión

    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `uploads/${fileName}`);

    // Convertir el archivo a un ArrayBuffer para subirlo
    const buffer = await file.arrayBuffer();
    await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });

    const downloadURL = await getDownloadURL(storageRef);

    return NextResponse.json({ url: downloadURL }, { status: 200 });

  } catch (error: any) {
    console.error('Error en la subida del archivo:', error);
    // Devolver un mensaje de error más específico
    const errorMessage = error.code || error.message || 'Error interno del servidor al subir el archivo.';
    return NextResponse.json({ error: `Error en el servidor: ${errorMessage}` }, { status: 500 });
  }
}
