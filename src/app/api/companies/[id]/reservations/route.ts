import { NextRequest, NextResponse } from 'next/server';
import { reservationService } from '@/services/reservation-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const companyId = params.id;
  console.log(`[API] GET /api/companies/${companyId}/reservations - Solicitud recibida`);
  try {
    if (!companyId) {
      console.error(`[API] GET /api/companies/${companyId}/reservations - Error: El ID de la compañía es requerido.`);
      return NextResponse.json({ error: 'El ID de la compañía es requerido' }, { status: 400 });
    }

    // El reservationService ya se encarga de serializar las fechas.
    const reservations = await reservationService.getReservationsByCompany(companyId);

    console.log(`[API] GET /api/companies/${companyId}/reservations - Se obtuvieron ${reservations.length} reservas.`);
    return NextResponse.json(reservations, { status: 200 });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/companies/${companyId}/reservations - Error:`, error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener las reservas.', details: error.message },
      { status: 500 }
    );
  }
}
