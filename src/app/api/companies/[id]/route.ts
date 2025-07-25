
import { NextRequest, NextResponse } from 'next/server';
import { companyService } from '@/services/company-service';
import type { Company } from '@/types';

// Placeholder for getting a specific company, if needed later
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await companyService.getCompanyById(params.id);
    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }
    return NextResponse.json(company, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Endpoint to update a company
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    const { companyData, user } = await request.json();

    // In a real app, you would add user permission checks here
    // For now, we assume if user object is passed, it's authorized.
    if (!user || !user.uid || !user.email) {
      return NextResponse.json({ error: 'Usuario no autenticado para esta acción.' }, { status: 403 });
    }


    const updatedCompany = await companyService.updateCompany(companyId, companyData, user);

    return NextResponse.json(
      {
        message: 'Empresa actualizada exitosamente',
        data: updatedCompany,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [API] PUT /api/companies/[id] - Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor al actualizar la empresa.' },
      { status: error.message.includes('validación') ? 400 : 500 }
    );
  }
}
