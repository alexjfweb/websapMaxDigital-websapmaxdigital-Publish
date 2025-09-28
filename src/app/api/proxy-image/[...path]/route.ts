
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');

    if (!filePath) {
      return new NextResponse('Ruta de imagen no proporcionada.', { status: 400 });
    }

    // La URL de Google Storage debe construirse sin el nombre del bucket al principio,
    // ya que viene en la ruta.
    const googleUrl = `https://storage.googleapis.com/${filePath}`;

    console.log(`[PROXY] Redirigiendo a: ${googleUrl}`);
    
    // Usamos una redirección permanente (308) para que los navegadores y bots cacheen la redirección.
    return NextResponse.redirect(googleUrl, { status: 308 });

  } catch (error) {
    console.error('[PROXY] Error en el proxy de imagen:', error);
    return new NextResponse('Error interno del servidor.', { status: 500 });
  }
}
