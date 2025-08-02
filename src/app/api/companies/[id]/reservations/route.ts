
import { NextRequest, NextResponse } from 'next/server';
import { reservationService } from '@/services/reservation-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const reservations = await reservationService.getReservationsByCompany(companyId);

    // Se devuelve un array vacío si no hay reservas, lo que es correcto.
    return NextResponse.json(reservations, { status: 200 });
    
  } catch (error: any) {
    console.error(`❌ [API] GET /api/companies/${params.id}/reservations - Error:`, error.message);
    // Este bloque ahora solo se ejecutará si hay un error real en el servicio, no si está vacío.
    return NextResponse.json(
      { error: 'Internal server error while fetching reservations.' },
      { status: 500 }
    );
  }
}
