
import { NextRequest, NextResponse } from 'next/server';

// Esta ruta de API ahora está obsoleta y no se usará para la subida.
// Se mantiene vacía para evitar errores si algo la sigue llamando por error,
// pero devolverá un error indicando que ya no está en uso.

export async function POST(request: NextRequest) {
  console.warn('⚠️ La ruta /api/upload está obsoleta. La subida de archivos ahora se maneja directamente desde el cliente a Firebase Storage.');
  return NextResponse.json(
    {
      success: false,
      error: 'Endpoint obsoleto',
      message: 'Esta ruta de API ya no está en uso. La subida de archivos debe realizarse directamente desde el cliente.',
    },
    { status: 410 } // 410 Gone
  );
}
