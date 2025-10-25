import { NextRequest, NextResponse } from 'next/server';
import { companyService } from '@/services/company-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await companyService.getCompanyById(params.id);
    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }
    // Devolver el objeto completo de la compañía, incluyendo los IDs de suscripción
    return NextResponse.json(company, { status: 200 });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/companies/${params.id} - Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    // La autenticación y autorización se manejarían con un middleware o en una capa superior en una app real.
    // Aquí, asumimos que el usuario que llama tiene permiso.
    const { companyData, user } = await request.json();

    if (!user || !user.uid || !user.email) {
      return NextResponse.json({ error: 'Usuario no autenticado para esta acción.' }, { status: 403 });
    }

    const updatedCompany = await companyService.updateCompany(companyId, companyData, user);

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error: any) {
    console.error('❌ [API] PUT /api/companies/[id] - Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor al actualizar la empresa.' },
      { status: error.message.includes('válido') || error.message.includes('RUC') ? 400 : 500 }
    );
  }
}
