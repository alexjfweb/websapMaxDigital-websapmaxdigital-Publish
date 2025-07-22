import { NextRequest, NextResponse } from 'next/server';
import { plansService } from '@/services/plans-service';
import { UpdatePlanRequest } from '@/types/plans';

// GET /api/plans/[id] - Obtener plan específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 [API] GET /api/plans/${id} - Iniciando solicitud`);
    
    const plan = await plansService.getPlanById(id);
    
    if (!plan) {
      console.warn(`⚠️ [API] GET /api/plans/${id} - Plan no encontrado`);
      return NextResponse.json({
        success: false,
        error: 'Plan no encontrado',
        timestamp: new Date()
      }, { status: 404 });
    }
    
    console.log(`✅ [API] GET /api/plans/${id} - Plan "${plan.name}" obtenido`);
    
    return NextResponse.json({
      success: true,
      data: plan,
      message: 'Plan obtenido exitosamente',
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/plans/[id] - Error:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// PUT /api/plans/[id] - Actualizar plan específico
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 [API] PUT /api/plans/${id} - Iniciando actualización`);
    
    // Obtener datos del request
    const body = await request.json();
    const planData: UpdatePlanRequest = body.plan;
    const userData = body.user;
    
    // Validar que el usuario sea superadmin
    if (!userData || userData.role !== 'superadmin') {
      console.warn(`⚠️ [API] PUT /api/plans/${id} - Usuario no autorizado:`, userData?.email);
      return NextResponse.json({
        success: false,
        error: 'No tienes permisos para actualizar planes',
        timestamp: new Date()
      }, { status: 403 });
    }
    
    // Obtener IP del cliente
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log(`📝 [API] PUT /api/plans/${id} - Actualizando plan por ${userData.email}`);
    
    const updatedPlan = await plansService.updatePlan(
      id,
      planData,
      userData.id,
      userData.email,
      ipAddress
    );
    
    console.log(`✅ [API] PUT /api/plans/${id} - Plan "${updatedPlan.name}" actualizado exitosamente`);
    
    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: 'Plan actualizado exitosamente',
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error(`❌ [API] PUT /api/plans/[id] - Error:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al actualizar el plan',
      timestamp: new Date()
    }, { status: 400 });
  }
}

// DELETE /api/plans/[id] - Eliminar plan específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 [API] DELETE /api/plans/${id} - Iniciando eliminación`);
    
    // Obtener datos del usuario desde headers o body
    const userData = request.headers.get('x-user-data');
    let user;
    
    try {
      user = userData ? JSON.parse(userData) : null;
    } catch {
      // Intentar obtener del body si no está en headers
      const body = await request.json().catch(() => ({}));
      user = body.user;
    }
    
    // Validar que el usuario sea superadmin
    if (!user || user.role !== 'superadmin') {
      console.warn(`⚠️ [API] DELETE /api/plans/${id} - Usuario no autorizado:`, user?.email);
      return NextResponse.json({
        success: false,
        error: 'No tienes permisos para eliminar planes',
        timestamp: new Date()
      }, { status: 403 });
    }
    
    // Obtener IP del cliente
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log(`📝 [API] DELETE /api/plans/${id} - Eliminando plan por ${user.email}`);
    
    await plansService.deletePlan(
      id,
      user.id,
      user.email,
      ipAddress
    );
    
    console.log(`✅ [API] DELETE /api/plans/${id} - Plan eliminado exitosamente`);
    
    return NextResponse.json({
      success: true,
      message: 'Plan eliminado exitosamente',
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error(`❌ [API] DELETE /api/plans/[id] - Error:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al eliminar el plan',
      timestamp: new Date()
    }, { status: 400 });
  }
} 