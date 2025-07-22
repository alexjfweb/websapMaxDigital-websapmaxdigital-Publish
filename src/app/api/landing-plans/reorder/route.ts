import { NextRequest, NextResponse } from 'next/server';
import { landingPlansService } from '@/services/landing-plans-service';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [API] POST /api/landing-plans/reorder - Iniciando solicitud');
    
    const body = await request.json();
    const { planIds, userId, userEmail } = body;
    
    // Validar datos requeridos
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Se requieren userId y userEmail' },
        { status: 400 }
      );
    }
    
    if (!planIds || !Array.isArray(planIds) || planIds.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de planIds válido' },
        { status: 400 }
      );
    }
    
    // Obtener IP y User Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'localhost';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await landingPlansService.reorderPlans(
      planIds,
      userId,
      userEmail,
      ipAddress,
      userAgent
    );
    
    console.log(`✅ [API] POST /api/landing-plans/reorder - ${planIds.length} planes reordenados`);
    
    return NextResponse.json({ 
      success: true, 
      message: `${planIds.length} planes reordenados correctamente` 
    });
  } catch (error: any) {
    console.error('❌ [API] POST /api/landing-plans/reorder - Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al reordenar los planes' },
      { status: 500 }
    );
  }
} 