
import { NextRequest, NextResponse } from 'next/server';
import { reservationService } from '@/services/reservation-service';

// Este endpoint ya no es necesario, ya que se ha creado uno dedicado en /api/reservations.
// Se puede eliminar este archivo, pero lo dejaremos vacío para evitar errores 404 si algo aún lo llama.
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use /api/reservations instead.' },
    { status: 410 }
  );
}
