
import { NextRequest, NextResponse } from 'next/server';
import { landingPlansService } from '@/services/landing-plans-service';

// POST /api/plans/reorder - Reordenar planes
export async function POST(request: NextRequest) {
  try {
    console.log('📝 [API] POST /api/plans/reorder - Iniciando reordenamiento');
    
    const body = await request.json();
    const { planIds, user } = body;
    
    // Validar datos
    if (!Array.isArray(planIds) || planIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Se requiere un array de IDs de planes',
        timestamp: new Date()
      }, { status: 400 });
    }
    
    // Validar que el usuario sea superadmin
    if (!user || user.role !== 'superadmin') {
      console.warn('⚠️ [API] POST /api/plans/reorder - Usuario no autorizado:', user?.email);
      return NextResponse.json({
        success: false,
        error: 'No tienes permisos para reordenar planes',
        timestamp: new Date()
      }, { status: 403 });
    }
    
    // Obtener IP del cliente
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log(`📝 [API] POST /api/plans/reorder - Reordenando ${planIds.length} planes por ${user.email}`);
    
    await landingPlansService.reorderPlans(planIds, user.id, user.email, ipAddress);
    
    console.log(`✅ [API] POST /api/plans/reorder - ${planIds.length} planes reordenados exitosamente`);
    
    return NextResponse.json({
      success: true,
      message: `${planIds.length} planes reordenados exitosamente`,
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('❌ [API] POST /api/plans/reorder - Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al reordenar los planes',
      timestamp: new Date()
    }, { status: 400 });
  }
}
