
import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const bucketName = 'websapmax-images'; 

    if (!filePath) {
      return new NextResponse('Ruta de imagen no proporcionada.', { status: 400 });
    }
    
    const adminApp = getFirebaseAdmin();
    const storage = getStorage(adminApp);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // Generar una URL firmada con una expiración corta.
    // Esto es más seguro que hacer los archivos públicos y soluciona problemas de caché.
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos
    });

    // Redirección temporal. Esto le dice al cliente/crawler que vaya a la URL firmada.
    return NextResponse.redirect(signedUrl, { status: 307 });

  } catch (error: any) {
    console.error(`[PROXY] Error al obtener URL firmada para la ruta '${params.path.join('/')}':`, error.message);
    
    // Si el error es 'not-found', devolver un 404 claro.
    if (error.code === 404) {
        return new NextResponse('Imagen no encontrada.', { status: 404 });
    }
    
    return new NextResponse('Error interno del servidor al procesar la imagen.', { status: 500 });
  }
}

    