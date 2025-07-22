// src/app/api/sync-database/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { databaseSyncService } from '@/services/database-sync-service';

/**
 * Endpoint para inicializar y sincronizar la base de datos.
 * Se puede llamar para asegurar que la estructura y datos iniciales existan.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔌 [API] POST /api/sync-database - Iniciando solicitud de sincronización');
    
    // En una aplicación real, aquí validarías que el usuario tiene permisos (p. ej. es superadmin)
    // Por ahora, asumimos que la llamada es autorizada.
    const user = {
      id: 'system-sync',
      email: 'sync@websapmax.com'
    };

    const resultMessage = await databaseSyncService.syncLandingPlans(user.id, user.email);

    console.log('✅ [API] POST /api/sync-database - Sincronización completada');
    
    return NextResponse.json({
      success: true,
      message: resultMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [API] POST /api/sync-database - Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor durante la sincronización',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
