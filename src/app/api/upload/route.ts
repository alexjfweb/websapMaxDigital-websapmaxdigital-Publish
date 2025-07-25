// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '@/lib/firebase'; // Import auth to check for user if needed

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Archivo no recibido' }, { status: 400 });
    }

    // Opcional: añadir validación de autenticación si es necesario
    // if (!auth.currentUser) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // Usar una ruta más específica para evitar colisiones
    const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('❌ /api/upload error:', err);
    return NextResponse.json({ error: err.message || 'Error en el servidor al subir el archivo.' }, { status: 500 });
  }
}