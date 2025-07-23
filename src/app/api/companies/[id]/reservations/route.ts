
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

    return NextResponse.json(reservations, { status: 200 });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/companies/${params.id}/reservations - Error:`, error.message);
    return NextResponse.json(
      { error: 'Internal server error while fetching reservations.' },
      { status: 500 }
    );
  }
}
