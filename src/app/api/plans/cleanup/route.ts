import { NextRequest, NextResponse } from 'next/server';
import { landingConfigService } from '@/services/landing-config-service';

// POST /api/plans/cleanup - Limpiar planes duplicados
export async function POST(request: NextRequest) {
  try {
    await landingConfigService.cleanupDuplicatePlans();
    
    return NextResponse.json({
      success: true,
      message: 'Planes duplicados eliminados exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error en API POST /api/plans/cleanup:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 