
import { NextRequest, NextResponse } from 'next/server';
import { landingPlansService } from '@/services/landing-plans-service';

export async function GET(request: NextRequest) {
  try {
    console.log('📝 [API] GET /api/landing-plans - Iniciando solicitud');
    
    // Obtenemos todos los planes activos desde el servicio.
    const allActivePlans = await landingPlansService.getPlans();
    
    // Filtramos para devolver SOLO los que son públicos.
    // Esta es la corrección clave para que "Plan Gratis Lite" no aparezca.
    const publicPlans = allActivePlans.filter(plan => plan.isPublic);
    
    console.log(`✅ [API] GET /api/landing-plans - ${publicPlans.length} planes públicos obtenidos`);
    
    // Devolvemos el array de planes directamente, que es lo que el frontend espera.
    return NextResponse.json(publicPlans);

  } catch (error: any) {
    console.error('❌ [API] GET /api/landing-plans - Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener los planes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [API] POST /api/landing-plans - Iniciando solicitud');
    
    const body = await request.json();
    const { userId, userEmail, ...planData } = body;
    
    // Validar datos requeridos
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Se requieren userId y userEmail' },
        { status: 400 }
      );
    }
    
    // Obtener IP y User Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'localhost';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const plan = await landingPlansService.createPlan(
      planData,
      userId,
      userEmail,
      ipAddress,
      userAgent
    );
    
    console.log(`✅ [API] POST /api/landing-plans - Plan creado: ${plan.name}`);
    
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('❌ [API] POST /api/landing-plans - Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear el plan' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('📝 [API] DELETE /api/landing-plans - Iniciando solicitud');
    
    const body = await request.json();
    const { userId, userEmail } = body;
    
    // Validar datos requeridos
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Se requieren userId y userEmail' },
        { status: 400 }
      );
    }
    
    // Obtener IP y User Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'localhost';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Obtener todos los planes y eliminarlos
    const plans = await landingPlansService.getPlans();
    
    for (const plan of plans) {
      await landingPlansService.deletePlan(
        plan.id,
        userId,
        userEmail,
        ipAddress,
        userAgent
      );
    }
    
    console.log(`✅ [API] DELETE /api/landing-plans - ${plans.length} planes eliminados`);
    
    return NextResponse.json({ 
      success: true, 
      message: `${plans.length} planes eliminados correctamente` 
    });
  } catch (error: any) {
    console.error('❌ [API] DELETE /api/landing-plans - Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar los planes' },
      { status: 500 }
    );
  }
}
