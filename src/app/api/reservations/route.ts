
import { NextRequest, NextResponse } from 'next/server';
import { reservationService } from '@/services/reservation-service';
import type { Reservation } from '@/types';

// El endpoint GET ya no es necesario, el hook ahora llama al servicio directamente.
// Lo mantenemos para las operaciones de escritura (POST, PUT).
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Este endpoint ha sido descontinuado para lectura. Use el servicio directamente.' },
    { status: 410 } // 410 Gone
  );
}

// Crea una nueva reserva (usado por el formulario público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Aquí el servicio del backend crea la reserva en Firestore
    const reservationId = await reservationService.createReservationInDB(body);
    return NextResponse.json({ id: reservationId }, { status: 201 });
  } catch (error: any) {
    console.error("[API POST /reservations] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Actualiza el estado de una reserva (usado por el panel de admin)
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID de reserva es requerido' }, { status: 400 });
  }

  try {
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'El estado es requerido' }, { status: 400 });
    }
    
    await reservationService.updateReservationStatus(id, status);
    return NextResponse.json({ message: 'Reserva actualizada' });
    
  } catch (error: any) {
    console.error(`[API PUT /reservations?id=${id}] Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
