import { NextRequest, NextResponse } from 'next/server';
import { landingPlansService } from '@/services/landing-plans-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 [API] GET /api/landing-plans/${id}/audit - Iniciando solicitud`);
    
    const logs = await landingPlansService.getPlanAuditLogs(id);
    
    console.log(`✅ [API] GET /api/landing-plans/${id}/audit - ${logs.length} logs obtenidos`);
    
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error(`❌ [API] GET /api/landing-plans/${params}/audit - Error:`, error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener el historial' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 [API] POST /api/landing-plans/${id}/audit - Iniciando rollback`);
    
    const body = await request.json();
    const { auditLogId, userId, userEmail } = body;
    
    // Validar datos requeridos
    if (!userId || !userEmail || !auditLogId) {
      return NextResponse.json(
        { error: 'Se requieren userId, userEmail y auditLogId' },
        { status: 400 }
      );
    }
    
    // Obtener IP y User Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'localhost';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const plan = await landingPlansService.rollbackPlan(
      id,
      auditLogId,
      userId,
      userEmail,
      ipAddress,
      userAgent
    );
    
    console.log(`✅ [API] POST /api/landing-plans/${id}/audit - Rollback completado: ${plan.name}`);
    
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error(`❌ [API] POST /api/landing-plans/${params}/audit - Error:`, error);
    return NextResponse.json(
      { error: error.message || 'Error al hacer rollback' },
      { status: 400 }
    );
  }
} 
