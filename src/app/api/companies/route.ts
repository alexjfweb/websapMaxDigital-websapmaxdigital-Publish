import { NextRequest, NextResponse } from 'next/server';
import { companyService } from '@/services/company-service';

export async function GET(request: NextRequest) {
  try {
    const companies = await companyService.getCompanies();
    return NextResponse.json(companies, { status: 200 });
  } catch (error: any) {
    console.error('❌ [API] GET /api/companies - Error:', error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener las empresas.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyData, user } = await request.json();
    
    if (!user || !user.uid || !user.email) {
      return NextResponse.json({ error: 'Usuario no autenticado para esta acción.' }, { status: 403 });
    }

    const newCompany = await companyService.createCompany(companyData, user);

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error: any) {
    console.error('❌ [API] POST /api/companies - Error:', error.message);
    
    const isValidationError = error.message.includes('obligatorio') || error.message.includes('RUC');
    
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor al crear la empresa.' },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
