
import { NextRequest, NextResponse } from 'next/server';
import { reservationService } from '@/services/reservation-service';
import type { Reservation } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ error: 'companyId es requerido' }, { status: 400 });
  }

  try {
    const reservations = await reservationService.getReservationsByCompany(companyId);
    return NextResponse.json(reservations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    const reservationId = await reservationService.createReservation(body);
    return NextResponse.json({ id: reservationId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
