// src/services/database-sync-service.ts
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { landingPlansService } from './landing-plans-service';
import { examplePlans } from '@/scripts/migrate-landing-plans';

class DatabaseSyncService {
  /**
   * Sincroniza los planes de la landing page, creando los de ejemplo si no existen.
   * @param userId El ID del usuario que ejecuta la acción.
   * @param userEmail El email del usuario.
   * @returns Un mensaje indicando el resultado de la operación.
   */
  async syncLandingPlans(userId: string, userEmail: string): Promise<string> {
    try {
      console.log('🔄 Iniciando verificación de sincronización de planes...');

      const plansCollection = collection(db, 'landingPlans');
      const existingPlansSnapshot = await getDocs(plansCollection);

      if (!existingPlansSnapshot.empty) {
        console.log('✅ Los planes ya existen. No se requiere sincronización.');
        return 'Los planes ya existen. No se requiere ninguna acción.';
      }

      console.log('📝 No se encontraron planes. Creando datos de ejemplo...');

      const batch = writeBatch(db);
      
      for (const planData of examplePlans) {
        // Usar doc() sin parámetros para generar un ID automático dentro de la colección
        const docRef = doc(collection(db, 'landingPlans'));
        batch.set(docRef, {
          ...planData,
          createdBy: userId,
          updatedBy: userId,
        });
      }
      
      await batch.commit();

      // Log de auditoría para la operación de sincronización
      await landingPlansService.logAudit(
        'system-sync', // planId puede ser un identificador genérico para la acción
        'created',
        userId,
        userEmail,
        { details: `Creación masiva de ${examplePlans.length} planes de ejemplo mediante sincronización.` }
      );

      console.log(`🎉 Sincronización completada. Se crearon ${examplePlans.length} planes.`);
      return `Sincronización completada. Se crearon ${examplePlans.length} planes.`;

    } catch (error) {
      console.error('❌ Error durante la sincronización de la base de datos:', error);
      throw new Error('No se pudo completar la sincronización de la base de datos.');
    }
  }
}

export const databaseSyncService = new DatabaseSyncService();
