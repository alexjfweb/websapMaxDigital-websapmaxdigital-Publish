// src/app/api/cron/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/services/subscription-service';
import { cleanupService } from '@/services/cleanup-service';

/**
 * Endpoint protegido para ser llamado por un job programado (Cron Job).
 * Ejecuta tareas de mantenimiento como degradar suscripciones expiradas
 * y limpiar datos de planes gratuitos.
 * 
 * En producción, se debe proteger este endpoint con un token secreto o una IP específica.
 * Por ejemplo: `https://<tu-dominio>.com/api/cron?secret=<TU_SECRET>`
 */
export async function GET(request: NextRequest) {
  // **Seguridad (Ejemplo):**
  // const secret = request.nextUrl.searchParams.get('secret');
  // if (secret !== process.env.CRON_SECRET) {
  //   return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
  // }

  console.log('🔵 [CRON JOB] Iniciando tareas de mantenimiento programadas...');

  try {
    // 1. Degradar suscripciones de prueba expiradas
    const downgradeResult = await subscriptionService.downgradeExpiredSubscriptions();
    console.log(`[CRON JOB] Resultado de la degradación: ${downgradeResult.downgraded} compañías actualizadas.`);

    // 2. Limpiar datos de cuentas en el plan Lite
    const cleanupResult = await cleanupService.cleanupLitePlanData();
    console.log(`[CRON JOB] Resultado de la limpieza: ${cleanupResult.deletedDocs} documentos eliminados de ${cleanupResult.cleanedCompanies} compañías.`);

    console.log('✅ [CRON JOB] Todas las tareas de mantenimiento se completaron exitosamente.');
    
    return NextResponse.json({
      success: true,
      message: 'Tareas de mantenimiento completadas.',
      downgradeResult,
      cleanupResult,
    });

  } catch (error: any) {
    console.error('❌ [CRON JOB] Error durante la ejecución de las tareas de mantenimiento:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al ejecutar las tareas de cron.' },
      { status: 500 }
    );
  }
}
