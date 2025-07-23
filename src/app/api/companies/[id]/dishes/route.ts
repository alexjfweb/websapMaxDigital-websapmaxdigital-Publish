
import { NextRequest, NextResponse } from 'next/server';
import { dishService } from '@/services/dish-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const dishes = await dishService.getDishesByCompany(companyId);

    return NextResponse.json(dishes, { status: 200 });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/companies/${params.id}/dishes - Error:`, error.message);
    return NextResponse.json(
      { error: 'Internal server error while fetching dishes.' },
      { status: 500 }
    );
  }
}
