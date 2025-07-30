
// src/services/database-sync-service.ts
import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { landingPlansService } from './landing-plans-service';

// Datos de ejemplo para los planes de la landing page
const examplePlans = [
  {
    slug: 'plan-gratuito',
    name: 'Prueba Gratuita',
    description: 'Prueba las funciones del Plan Estándar durante 7 días sin compromiso. No se requiere tarjeta de crédito.',
    price: 0,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Acceso a todas las funciones del Plan Estándar',
      'Gestión de Menú Digital Ilimitado',
      'Recepción de Pedidos Online',
      'Sistema de Reservas Web',
      'Soporte por email durante la prueba'
    ],
    isActive: true,
    isPublic: true,
    isPopular: false,
    order: 1,
    icon: 'zap',
    color: 'gray',
    maxUsers: 5,
    maxProjects: 1, // Limite para la prueba
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
      'Recepción de Pedidos Locales (en el local)',
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
    ctaText: 'Elegir Básico',
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
      'Sistema de Reservas desde tu Web',
      'Personalización de Colores y Logo',
      'Reportes de Ventas Avanzados',
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
    ctaText: 'Iniciar Prueba de 7 Días',
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
      'Gestión de Múltiples Usuarios con Roles',
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
    ctaText: 'Elegir Premium',
  },
  {
    slug: 'plan-empresarial',
    name: 'Empresarial',
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
    maxUsers: -1,
    maxProjects: -1, // Ilimitado
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
