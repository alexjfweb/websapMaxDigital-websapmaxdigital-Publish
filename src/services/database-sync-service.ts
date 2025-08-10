
// src/services/database-sync-service.ts
import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { landingPlansService } from './landing-plans-service';

// Datos de ejemplo para los planes de la landing page
const examplePlans = [
  {
    id: 'plan_gratis_lite',
    name: 'Plan Gratis Lite',
    description: 'Funcionalidad limitada para mantener el acceso básico. Los datos no esenciales se limpian periódicamente.',
    price: 0,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Hasta 3 platos',
      'Hasta 2 pedidos diarios',
      'Hasta 1 reserva diaria',
      '1 empleado',
      'Sin personalización de logo/colores',
      'Sin reportes'
    ],
    isActive: true,
    isPublic: false, // No se muestra en la UI de planes
    isPopular: false,
    order: 0, // El orden más bajo
    icon: 'zap',
    color: 'gray',
    maxUsers: 1,
    maxProjects: 1,
    ctaText: 'Plan de Contingencia',
    // Nuevos campos para límites
    maxDishes: 3,
    maxOrders: 2,
    maxReservations: 1,
    allowLogo: false,
    allowColors: false,
    allowReports: false,
    autoCleanup: true,
  },
  {
    slug: 'plan-gratuito',
    name: 'Prueba Gratuita (7 días)',
    description: 'Prueba las funciones del Plan Estándar durante 7 días sin compromiso. No se requiere tarjeta de crédito.',
    price: 0,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Menú Digital con QR y personalización',
      'Gestión de Pedidos Online',
      'Sistema de Reservas Web',
      'Hasta 5 usuarios',
      'Soporte por email durante la prueba'
    ],
    isActive: true,
    isPublic: true,
    isPopular: false,
    order: 1,
    icon: 'zap',
    color: 'gray',
    maxUsers: 5,
    maxProjects: 1, // Representa el número de "restaurantes" o "sucursales"
    ctaText: 'Comenzar Prueba Gratuita',
  },
  {
    slug: 'plan-basico',
    name: 'Básico',
    description: 'Funciones esenciales para restaurantes pequeños y startups que necesitan digitalizar su operación principal.',
    price: 19.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Menú Digital con QR',
      'Gestión de Platos Ilimitada',
      'Pedidos para consumo en el local',
      'Reportes de Ventas Simples',
      'Soporte por email (respuesta en 48h)'
    ],
    isActive: true,
    isPublic: true,
    isPopular: false,
    order: 2,
    icon: 'star',
    color: 'blue',
    maxUsers: 3,
    maxProjects: 1,
    ctaText: 'Elegir Plan Básico',
  },
  {
    slug: 'plan-estandar',
    name: 'Estándar',
    description: 'La solución ideal para restaurantes en crecimiento que buscan ampliar su presencia online y optimizar su servicio.',
    price: 49.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Todo en el Plan Básico',
      'Pedidos Online para Domicilio y Recogida',
      'Sistema de Reservas integrable en web',
      'Personalización de Logo y Colores',
      'Reportes Avanzados (platos más vendidos)',
      'Soporte por Chat (respuesta en 24h)'
    ],
    isActive: true,
    isPublic: true,
    isPopular: true,
    order: 3,
    icon: 'dollar',
    color: 'purple',
    maxUsers: 10,
    maxProjects: 1,
    ctaText: 'Actualizar a Estándar',
  },
  {
    slug: 'plan-premium',
    name: 'Premium',
    description: 'Para restaurantes con alto volumen que requieren herramientas avanzadas de marketing y gestión de equipos.',
    price: 99.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Todo en el Plan Estándar',
      'Herramientas de Fidelización (cupones, puntos)',
      'Gestión de Empleados con Roles',
      'Integración con Redes Sociales',
      'Automatización de Marketing por Email',
      'Soporte Prioritario por Chat'
    ],
    isActive: true,
    isPublic: true,
    isPopular: false,
    order: 4,
    icon: 'users',
    color: 'green',
    maxUsers: -1, // Ilimitado
    maxProjects: 1,
    ctaText: 'Obtener Premium',
  },
  {
    slug: 'plan-profesional',
    name: 'Profesional',
    description: 'Solución a medida para cadenas, franquicias y grandes grupos gastronómicos con necesidades complejas.',
    price: 249.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Todo en el Plan Premium',
      'Gestión Multi-Sucursal',
      'Control Avanzado de Roles y Permisos',
      'Acceso a la API para Integraciones Propias',
      'Reportes Consolidados por Cadena',
      'Soporte Dedicado y Onboarding Personalizado'
    ],
    isActive: true,
    isPublic: true,
    isPopular: false,
    order: 5,
    icon: 'calendar',
    color: 'indigo',
    maxUsers: -1, // Ilimitado
    maxProjects: -1, // Ilimitado
    ctaText: 'Contactar a Ventas',
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
        // Verificar si el plan 'plan_gratis_lite' ya existe
        const litePlanExists = existingPlansSnapshot.docs.some(doc => doc.id === 'plan_gratis_lite' || doc.data().slug === 'plan_gratis_lite');
        if (litePlanExists) {
            console.log('✅ Los planes, incluyendo el Plan Gratis Lite, ya existen. No se requiere sincronización.');
            return 'Los planes ya existen. No se requiere ninguna acción.';
        }
      }

      console.log('📝 No se encontraron todos los planes. Creando o actualizando datos de ejemplo...');

      const batch = writeBatch(db);
      
      for (const planData of examplePlans) {
        // Usamos el `id` o el `slug` como identificador único del documento para evitar duplicados.
        const docId = planData.id || planData.slug;
        const docRef = doc(db, 'landingPlans', docId);

        const fullPlanData = {
          ...planData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: userId,
          updatedBy: userId,
        };
        // set con merge:true para crear o actualizar sin sobreescribir campos existentes no definidos en `fullPlanData`.
        batch.set(docRef, fullPlanData, { merge: true });
      }
      
      await batch.commit();

      // Log de auditoría para la operación masiva
      await landingPlansService.logAudit(
        'system-sync',
        'created',
        userId,
        userEmail,
        { details: `Sincronización de ${examplePlans.length} planes de ejemplo.` }
      );

      console.log(`🎉 Sincronización completada. Se crearon o actualizaron ${examplePlans.length} planes.`);
      return `Sincronización completada. Se crearon o actualizaron ${examplePlans.length} planes.`;

    } catch (error) {
      console.error('❌ Error durante la sincronización de la base de datos:', error);
      throw new Error('No se pudo completar la sincronización de la base de datos.');
    }
  }
}

export const databaseSyncService = new DatabaseSyncService();
