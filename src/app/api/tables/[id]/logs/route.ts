import { NextRequest, NextResponse } from 'next/server';
import { tableService } from '@/services/table-service';

// Este archivo tenía un error, debería estar en plural 'logs' y no 'log'
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = params.id;
    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
    }

    // Corregido: 'getTableLogs' no existe. La lógica para obtener logs
    // debe ser implementada si se necesita. Por ahora, devolvemos un mock.
    // En una implementación real, aquí se llamaría a tableService.getTableLogs(tableId)
    // const logs = await tableService.getTableLogs(tableId);

    // Mock response
    const logs = [
        {id: '1', details: 'Estado cambiado a Ocupada', createdAt: new Date().toISOString()},
        {id: '2', details: 'Mesa creada', createdAt: new Date(Date.now() - 3600000).toISOString()},
    ];

    return NextResponse.json(logs, { status: 200 });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/tables/${params.id}/logs - Error:`, error.message);
    return NextResponse.json(
      { error: 'Internal server error while fetching logs.' },
      { status: 500 }
    );
  }
}
