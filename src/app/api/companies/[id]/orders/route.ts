
import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/order-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const companyId = params.id;
  console.log(`[API] GET /api/companies/${companyId}/orders - Solicitud recibida`);
  try {
    if (!companyId) {
      console.error(`[API] GET /api/companies/${companyId}/orders - Error: El ID de la compañía es requerido.`);
      return NextResponse.json({ error: 'El ID de la compañía es requerido' }, { status: 400 });
    }

    const orders = await orderService.getOrdersByCompany(companyId);

    console.log(`[API] GET /api/companies/${companyId}/orders - Se obtuvieron ${orders.length} pedidos.`);
    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/companies/${companyId}/orders - Error:`, error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener los pedidos.', details: error.message },
      { status: 500 }
    );
  }
}
