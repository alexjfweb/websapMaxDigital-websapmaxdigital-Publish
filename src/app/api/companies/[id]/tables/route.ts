import { NextRequest, NextResponse } from 'next/server';
import { tableService } from '@/services/table-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const tables = await tableService.getAllTables(companyId);

    return NextResponse.json(tables, { status: 200 });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/companies/${params.id}/tables - Error:`, error.message);
    return NextResponse.json(
      { error: 'Internal server error while fetching tables.' },
      { status: 500 }
    );
  }
}
