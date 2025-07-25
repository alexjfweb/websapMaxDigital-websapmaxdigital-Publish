import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/services/storage-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo.' }, { status: 400 });
    }

    // Usar el servicio de almacenamiento centralizado
    const downloadURL = await storageService.uploadFile(file, 'uploads/');

    return NextResponse.json({ url: downloadURL }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error en el endpoint de subida /api/upload:', error.message);
    // Devolver un error más específico al cliente
    return NextResponse.json(
      { error: 'Error al subir el archivo.', details: error.message },
      { status: 500 }
    );
  }
}
