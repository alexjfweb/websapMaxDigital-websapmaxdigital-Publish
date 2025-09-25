
import { NextRequest, NextResponse } from 'next/server';

const BUCKET_NAME = 'websapmax-images';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');

    if (!filePath) {
      return NextResponse.json({ error: 'Ruta de imagen no proporcionada.' }, { status: 400 });
    }

    // Construir la URL original de Google Cloud Storage
    const googleUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filePath}`;

    // Opción 1: Redirección (más simple y eficiente para este caso)
    // Usamos una redirección temporal (307) para indicar que el recurso está en otra parte.
    // Esto es amigable para los rastreadores como el de WhatsApp.
    return NextResponse.redirect(googleUrl, { status: 307 });

    // Opción 2: Proxy real (más complejo, consume más recursos del servidor)
    /*
    const imageResponse = await fetch(googleUrl);
    if (!imageResponse.ok) {
        return new NextResponse('Imagen no encontrada en el almacenamiento.', { status: 404 });
    }
    const blob = await imageResponse.blob();
    const headers = new Headers();
    headers.set('Content-Type', imageResponse.headers.get('Content-Type') || 'image/png');
    return new NextResponse(blob, { status: 200, headers });
    */

  } catch (error) {
    console.error('Error en el proxy de imagen:', error);
    return new NextResponse('Error interno del servidor.', { status: 500 });
  }
}
