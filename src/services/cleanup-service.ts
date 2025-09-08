// src/services/cleanup-service.ts
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auditService } from './audit-service';

class CleanupService {
  
  /**
   * Limpia los datos no esenciales para todas las compañías en el 'plan-gratis-lite'.
   * Elimina pedidos y reservas.
   * Esta función está diseñada para ser ejecutada por un job programado (ej. cada 24 horas).
   */
  async cleanupLitePlanData(): Promise<{ cleanedCompanies: number; deletedDocs: number }> {
    const db = getDb();
    console.log('🧹 [CleanupService] Iniciando limpieza de datos para planes Lite...');

    const companiesRef = collection(db, 'companies');
    const litePlanQuery = query(companiesRef, where('planId', '==', 'plan-gratis-lite'));
    
    const liteCompaniesSnapshot = await getDocs(litePlanQuery);
    
    if (liteCompaniesSnapshot.empty) {
      console.log('✅ [CleanupService] No hay compañías en el plan Lite. No se requiere limpieza.');
      return { cleanedCompanies: 0, deletedDocs: 0 };
    }

    let totalDeletedDocs = 0;
    
    for (const companyDoc of liteCompaniesSnapshot.docs) {
      const companyId = companyDoc.id;
      const companyName = companyDoc.data().name;
      const batch = writeBatch(db);
      let docsInBatch = 0;

      console.log(`[CleanupService] Procesando compañía: ${companyName} (${companyId})`);

      // 1. Limpiar Pedidos (Orders)
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(ordersRef, where('restaurantId', '==', companyId));
      const ordersSnapshot = await getDocs(ordersQuery);
      
      ordersSnapshot.forEach(doc => {
        batch.delete(doc.ref);
        docsInBatch++;
      });
      if (!ordersSnapshot.empty) console.log(`   - Marcados para eliminar: ${ordersSnapshot.size} pedidos.`);

      // 2. Limpiar Reservas (Reservations)
      const reservationsRef = collection(db, 'reservations');
      const reservationsQuery = query(reservationsRef, where('restaurantId', '==', companyId));
      const reservationsSnapshot = await getDocs(reservationsQuery);
      
      reservationsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
        docsInBatch++;
      });
       if (!reservationsSnapshot.empty) console.log(`   - Marcadas para eliminar: ${reservationsSnapshot.size} reservas.`);
      
      // Aquí se podrían añadir más colecciones a limpiar (ej. reportes, logs específicos)
      
      if (docsInBatch > 0) {
        await batch.commit();
        console.log(`   - Lote ejecutado. ${docsInBatch} documentos eliminados para ${companyName}.`);
        totalDeletedDocs += docsInBatch;
        
        // Registrar en auditoría
        await auditService.log({
          entity: 'companies',
          entityId: companyId,
          action: 'deleted', // Se usa 'deleted' para indicar borrado de sub-datos
          performedBy: { uid: 'system-cron', email: 'system@websapmax.com' },
          details: `Limpieza automática de datos del Plan Gratis Lite. ${docsInBatch} documentos eliminados (pedidos, reservas, etc.).`,
        });
      } else {
        console.log(`   - No se encontraron documentos para limpiar para ${companyName}.`);
      }
    }
    
    console.log(`✅ [CleanupService] Limpieza completada. ${liteCompaniesSnapshot.size} compañías revisadas, ${totalDeletedDocs} documentos eliminados.`);
    return { cleanedCompanies: liteCompaniesSnapshot.size, deletedDocs: totalDeletedDocs };
  }
}

export const cleanupService = new CleanupService();
