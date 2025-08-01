
import { NextRequest, NextResponse } from 'next/server';
import { landingPlansService } from '@/services/landing-plans-service';

// GET /api/plans/[id]/history - Obtener historial de un plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`📝 [API] GET /api/plans/${id}/history - Iniciando solicitud de historial`);
    
    // Verificar que el plan existe
    const plan = await landingPlansService.getPlanById(id);
    if (!plan) {
      console.warn(`⚠️ [API] GET /api/plans/${id}/history - Plan no encontrado`);
      return NextResponse.json({
        success: false,
        error: 'Plan no encontrado',
        timestamp: new Date()
      }, { status: 404 });
    }
    
    const history = await landingPlansService.getPlanAuditLogs(id);
    
    console.log(`✅ [API] GET /api/plans/${id}/history - ${history.length} entradas de historial obtenidas`);
    
    return NextResponse.json({
      success: true,
      data: history,
      message: `${history.length} entradas de historial obtenidas`,
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error(`❌ [API] GET /api/plans/[id]/history - Error:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al obtener el historial',
      timestamp: new Date()
    }, { status: 500 });
  }
}
