import { NextRequest, NextResponse } from 'next/server';
import { plansService } from '@/services/plans-service';
import { CreatePlanRequest } from '@/types/plans';

// GET /api/plans - Obtener todos los planes
export async function GET(request: NextRequest) {
  try {
    console.log('📝 [API] GET /api/plans - Iniciando solicitud');
    
    const plans = await plansService.getPlans();
    
    console.log(`✅ [API] GET /api/plans - ${plans.length} planes obtenidos`);
    
    return NextResponse.json({
      success: true,
      data: plans,
      message: `${plans.length} planes obtenidos exitosamente`,
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('❌ [API] GET /api/plans - Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// POST /api/plans - Crear nuevo plan
export async function POST(request: NextRequest) {
  try {
    console.log('📝 [API] POST /api/plans - Iniciando creación de plan');
    
    // Obtener datos del request
    const body = await request.json();
    const planData: CreatePlanRequest = body.plan;
    const userData = body.user;
    
    // Validar que el usuario sea superadmin
    if (!userData || userData.role !== 'superadmin') {
      console.warn('⚠️ [API] POST /api/plans - Usuario no autorizado:', userData?.email);
      return NextResponse.json({
        success: false,
        error: 'No tienes permisos para crear planes',
        timestamp: new Date()
      }, { status: 403 });
    }
    
    // Obtener IP del cliente
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log(`📝 [API] POST /api/plans - Creando plan "${planData.name}" por ${userData.email}`);
    
    const newPlan = await plansService.createPlan(
      planData,
      userData.id,
      userData.email,
      ipAddress
    );
    
    console.log(`✅ [API] POST /api/plans - Plan "${planData.name}" creado exitosamente`);
    
    return NextResponse.json({
      success: true,
      data: newPlan,
      message: 'Plan creado exitosamente',
      timestamp: new Date()
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ [API] POST /api/plans - Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al crear el plan',
      timestamp: new Date()
    }, { status: 400 });
  }
} 