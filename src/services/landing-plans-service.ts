import { auditService } from './audit-service';
// ¡HEMOS QUITADO los imports de 'firebase/firestore' y '@/lib/firebase' de aquí!

// ... (todas tus interfaces LandingPlan, CreatePlanRequest, etc. permanecen igual) ...
export interface LandingPlan { /* ... */ }
export interface CreatePlanRequest { /* ... */ }
// ...etc...

class LandingPlansService {
  private readonly COLLECTION_NAME = 'landingPlans';
  private readonly AUDIT_COLLECTION = 'planAuditLogs';

  // ... (tus funciones privadas como generateSlug, parseTimestamp, etc., permanecen igual) ...
  private generateSlug(name: string): string { /* ... */ }
  private parseTimestamp(timestamp: any): Date {
      // Este método necesita Timestamp, así que lo importamos dinámicamente o lo pasamos como argumento.
      // Por simplicidad, asumimos que no se llamará directamente desde el exterior.
      // Si se necesita, también podemos aplicar la importación dinámica aquí.
      // Para este caso, vamos a asumir que está bien por ahora.
      /* ... */
  }
  private validatePlanData(data: CreatePlanRequest | UpdatePlanRequest): string[] { /* ... */ }

  private async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
      const { db } = await import('@/lib/firebase');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      // ... (el resto de la lógica de validateSlug) ...
  }
  
  // ... (resto de tus métodos, cada uno con sus imports dinámicos) ...

  // EJEMPLO para getPlans:
  async getPlans(): Promise<LandingPlan[]> {
    const { db } = await import('@/lib/firebase');
    const { collection, query, orderBy, getDocs, Timestamp } = await import('firebase/firestore');
    
    // Aquí, como parseTimestamp necesita Timestamp, lo importamos y lo pasamos si es necesario,
    // o simplemente redefinimos la lógica de parseo aquí si es más fácil.
    const parseTimestampLocal = (ts: any): Date => {
      if (!ts) return new Date();
      if (ts instanceof Timestamp) return ts.toDate();
      // ... (resto de la lógica de parseo) ...
      return new Date(ts);
    }

    try {
      const q = query(collection(db, this.COLLECTION_NAME), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const plans: LandingPlan[] = [];
      snapshot.forEach(doc => {
        // ... (el resto de tu lógica de getPlans, usando parseTimestampLocal) ...
      });
      return plans;
    } catch (error) {
      console.error('Error getting plans:', error);
      throw new Error('Error al obtener los planes');
    }
  }

  // DEBERÁS APLICAR ESTE PATRÓN A TODOS LOS DEMÁS MÉTODOS EN landing-plans-service.ts
  // (subscribeToPlans, getPlanById, createPlan, updatePlan, etc.)
}

export const landingPlansService = new LandingPlansService();