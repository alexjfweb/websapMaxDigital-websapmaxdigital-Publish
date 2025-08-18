
// Este archivo ya no es necesario y puede ser eliminado.
// La subida de archivos ahora se gestiona directamente desde el cliente
// a través del servicio `src/services/storage-service.ts` que usa el SDK de cliente de Firebase.
// Dejarlo vacío previene errores si alguna parte del código aún lo referencia por error.
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use the client-side storage service instead.' },
    { status: 410 } // 410 Gone
  );
}
