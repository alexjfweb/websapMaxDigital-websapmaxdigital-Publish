import { NextRequest, NextResponse } from 'next/server';
import { tableService } from '@/services/table-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = params.id;
    if (!tableId) {
      return NextResponse.json({ error: 'El ID de la mesa es requerido' }, { status: 400 });
    }

    const logs = await tableService.getTableLogs(tableId);

    return NextResponse.json(logs, { status: 200 });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/tables/${params.id}/logs - Error:`, error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener los logs de la mesa.' },
      { status: 500 }
    );
  }
}
