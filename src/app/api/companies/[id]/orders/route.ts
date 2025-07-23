
import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/order-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    if (!companyId) {
      return NextResponse.json({ error: 'El ID de la compañía es requerido' }, { status: 400 });
    }

    const orders = await orderService.getOrdersByCompany(companyId);

    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/companies/${params.id}/orders - Error:`, error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener los pedidos.' },
      { status: 500 }
    );
  }
}
