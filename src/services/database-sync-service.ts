// src/services/database-sync-service.ts
import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { landingPlansService } from './landing-plans-service';

// Datos de ejemplo para los planes de la landing page
const examplePlans = [
  {
    slug: 'basico',
    name: 'Básico',
    description: 'Perfecto para pequeñas empresas que están comenzando.',
    price: 29.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Hasta 5 usuarios',
      'Funciones básicas de gestión',
      'Soporte por email',
      'Actualizaciones gratuitas',
      'Acceso a plantillas básicas'
    ],
    isActive: true,
    isPublic: true,
    isPopular: false,
    order: 1,
    icon: 'zap',
    color: 'blue',
    maxUsers: 5,
    maxProjects: 10,
    ctaText: 'Comenzar Prueba Gratuita',
  },
  {
    slug: 'profesional',
    name: 'Profesional',
    description: 'Ideal para equipos en crecimiento que necesitan más funcionalidades.',
    price: 79.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Hasta 25 usuarios',
      'Todas las funciones del plan básico',
      'Soporte prioritario',
      'Integraciones avanzadas',
      'Reportes detallados',
      'API de acceso'
    ],
    isActive: true,
    isPublic: true,
    isPopular: true,
    order: 2,
    icon: 'star',
    color: 'purple',
    maxUsers: 25,
    maxProjects: 50,
    ctaText: 'Comenzar Prueba Gratuita',
  },
  {
    slug: 'empresarial',
    name: 'Empresarial',
    description: 'Para grandes organizaciones que requieren máxima funcionalidad y soporte.',
    price: 199.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Usuarios ilimitados',
      'Todas las funciones del plan profesional',
      'Soporte 24/7 con chat en vivo',
      'Onboarding dedicado',
      'SLA garantizado'
    ],
    isActive: true,
    isPublic: true,
    isPopular: false,
    order: 3,
    icon: 'dollar',
    color: 'green',
    maxUsers: -1,
    maxProjects: -1,
    ctaText: 'Contactar Ventas',
  }
];

class DatabaseSyncService {
  /**
   * Sincroniza los planes de la landing page, creando los de ejemplo si no existen.
   * @param userId El ID del usuario que ejecuta la acción (puede ser 'system').
   * @param userEmail El email del usuario.
   * @returns Un mensaje indicando el resultado de la operación.
   */
  async syncLandingPlans(userId: string, userEmail: string): Promise<string> {
    if (!db) {
        const errorMsg = "La base de datos no está disponible. La sincronización falló.";
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
    }
      
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
        const docRef = doc(collection(db, 'landingPlans'));
        const fullPlanData = {
          ...planData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: userId,
          updatedBy: userId,
        };
        batch.set(docRef, fullPlanData);
      }
      
      await batch.commit();

      // Log de auditoría para la operación masiva
      await landingPlansService.logAudit(
        'system-sync',
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
