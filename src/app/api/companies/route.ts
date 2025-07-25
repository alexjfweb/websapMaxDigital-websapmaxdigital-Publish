
import { NextRequest, NextResponse } from 'next/server';
import { companyService, type CreateCompanyInput } from '@/services/company-service';

/**
 * Maneja las solicitudes GET para obtener todas las empresas.
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📝 [API] GET /api/companies - Solicitud recibida para obtener empresas');

    const companies = await companyService.getCompanies();

    console.log(`✅ [API] GET /api/companies - Se encontraron ${companies.length} empresas.`);

    return NextResponse.json({
      message: 'Empresas obtenidas exitosamente',
      data: companies
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [API] GET /api/companies - Error:', error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener las empresas.' },
      { status: 500 }
    );
  }
}


/**
 * Maneja las solicitudes POST para crear una nueva empresa.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Obtener los datos del cuerpo de la solicitud
    const { companyData, user } = await request.json();

    console.log('📝 [API] POST /api/companies - Solicitud recibida para crear empresa:', companyData);
    
    // User data is needed for audit trail
    if (!user || !user.uid || !user.email) {
      return NextResponse.json({ error: 'Usuario no autenticado para esta acción.' }, { status: 403 });
    }


    // 2. Llamar al servicio para crear la empresa (la validación está dentro del servicio)
    const newCompanyId = await companyService.createCompany(companyData, user);

    console.log(`✅ [API] POST /api/companies - Empresa creada con ID: ${newCompanyId}`);

    // 3. Devolver una respuesta exitosa
    return NextResponse.json(
      { 
        message: 'Empresa creada exitosamente', 
        companyId: newCompanyId 
      },
      { status: 201 } // 201 Created
    );

  } catch (error: any) {
    console.error('❌ [API] POST /api/companies - Error:', error.message);

    // 4. Manejar errores de validación o del servidor
    // Si el error es una instancia de Error con un mensaje específico (como el de validación),
    // se puede devolver como un 400 Bad Request.
    if (error.message.includes('obligatorio')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Para otros errores, devolver un 500 Internal Server Error.
    return NextResponse.json(
      { error: 'Error interno del servidor al crear la empresa.' },
      { status: 500 }
    );
  }
}
