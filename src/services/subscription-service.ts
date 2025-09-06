
// src/services/subscription-service.ts
import { getDb } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { auditService } from './audit-service';
import type { Company } from '@/types';

class SubscriptionService {
  private get companiesCollection() {
    const db = getDb();
    return collection(db, 'companies');
  }

  /**
   * Checks for expired trial subscriptions and downgrades them to the 'plan-gratis-lite'.
   * This function is intended to be run periodically by a scheduled job.
   */
  async downgradeExpiredSubscriptions(): Promise<{ downgraded: number; checked: number }> {
    console.log('🔄 [SubscriptionService] Iniciando la verificación de suscripciones expiradas...');

    const now = Timestamp.now();
    
    // 1. Busca compañías cuyo período de prueba ha terminado, no están activas y no han sido ya degradadas.
    const q = query(
      this.companiesCollection,
      where('trialEndsAt', '<=', now),
      where('subscriptionStatus', '!=', 'active'),
      where('planId', '!=', 'plan-gratis-lite')
    );

    const expiredSubscriptionsSnapshot = await getDocs(q);
    const totalToCheck = expiredSubscriptionsSnapshot.size;

    if (totalToCheck === 0) {
      console.log('✅ [SubscriptionService] No se encontraron suscripciones expiradas para degradar.');
      return { downgraded: 0, checked: 0 };
    }

    console.log(`[SubscriptionService] Se encontraron ${totalToCheck} suscripciones para procesar.`);
    const db = getDb();
    const batch = writeBatch(db);
    let downgradedCount = 0;

    for (const doc of expiredSubscriptionsSnapshot.docs) {
      const company = { id: doc.id, ...doc.data() } as Company;
      
      const updateData = {
        planId: 'plan-gratis-lite',
        subscriptionStatus: 'canceled' as const, // O un nuevo estado 'lite' si se prefiere
      };

      batch.update(doc.ref, updateData);

      // Log de auditoría para cada compañía degradada
      await auditService.log({
        entity: 'companies',
        entityId: company.id,
        action: 'updated',
        performedBy: { uid: 'system-cron', email: 'system@websapmax.com' },
        previousData: { planId: company.planId, subscriptionStatus: company.subscriptionStatus },
        newData: updateData,
        details: `La suscripción de la compañía fue degradada automáticamente al Plan Gratis Lite por expiración.`,
      });

      downgradedCount++;
      console.log(`[SubscriptionService] Compañía ${company.name} (${company.id}) marcada para degradar.`);
    }

    // 3. Ejecutar el batch
    await batch.commit();

    console.log(`✅ [SubscriptionService] Proceso completado. ${downgradedCount} compañías degradadas.`);
    return { downgraded: downgradedCount, checked: totalToCheck };
  }
}

export const subscriptionService = new SubscriptionService();
