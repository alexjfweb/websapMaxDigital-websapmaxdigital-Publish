import { NextRequest, NextResponse } from 'next/server';
import { landingPlansService } from '@/services/landing-plans-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 [API] GET /api/landing-plans/${id} - Iniciando solicitud`);
    
    const plan = await landingPlansService.getPlanById(id);
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }
    
    console.log(`✅ [API] GET /api/landing-plans/${id} - Plan obtenido: ${plan.name}`);
    
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error(`❌ [API] GET /api/landing-plans/${params} - Error:`, error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener el plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 [API] PUT /api/landing-plans/${id} - Iniciando solicitud`);
    
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
    
    const plan = await landingPlansService.updatePlan(
      id,
      planData,
      userId,
      userEmail,
      ipAddress,
      userAgent
    );
    
    console.log(`✅ [API] PUT /api/landing-plans/${id} - Plan actualizado: ${plan.name}`);
    
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error(`❌ [API] PUT /api/landing-plans/${params} - Error:`, error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el plan' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 [API] DELETE /api/landing-plans/${id} - Iniciando solicitud`);
    
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
    
    await landingPlansService.deletePlan(
      id,
      userId,
      userEmail,
      ipAddress,
      userAgent
    );
    
    console.log(`✅ [API] DELETE /api/landing-plans/${id} - Plan eliminado`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Plan eliminado correctamente' 
    });
  } catch (error: any) {
    console.error(`❌ [API] DELETE /api/landing-plans/${params} - Error:`, error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el plan' },
      { status: 500 }
    );
  }
} 
