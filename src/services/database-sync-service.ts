
// src/services/database-sync-service.ts
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { landingConfigService } from './landing-config-service';
import { landingPlansService } from './landing-plans-service';

// Planes de ejemplo
const examplePlans = [
  {
    id: 'plan_gratis_lite',
    slug: 'plan-gratis-lite',
    name: 'Plan Gratis Lite',
    description: 'Funcionalidad limitada para mantener el acceso básico. Los datos no esenciales se limpian periódicamente.',
    price: 0, currency: 'USD', period: 'monthly',
    features: ['Hasta 3 platos', 'Hasta 2 pedidos diarios', 'Hasta 1 reserva diaria', '1 empleado', 'Sin personalización de logo/colores', 'Sin reportes'],
    isActive: true, isPublic: false, isPopular: false, order: 0, icon: 'zap', color: 'gray', maxUsers: 1, maxProjects: 1, ctaText: 'Plan de Contingencia',
  },
  {
    slug: 'plan-gratuito', name: 'Prueba Gratuita (7 días)',
    description: 'Prueba las funciones del Plan Estándar durante 7 días sin compromiso. No se requiere tarjeta de crédito.',
    price: 0, currency: 'USD', period: 'monthly',
    features: ['Menú Digital con QR y personalización', 'Gestión de Pedidos Online', 'Sistema de Reservas Web', 'Hasta 5 usuarios', 'Soporte por email durante la prueba'],
    isActive: true, isPublic: true, isPopular: false, order: 1, icon: 'zap', color: 'gray', maxUsers: 5, maxProjects: 1, ctaText: 'Comenzar Prueba Gratuita',
  },
  {
    slug: 'plan-basico', name: 'Básico',
    description: 'Funciones esenciales para restaurantes pequeños y startups que necesitan digitalizar su operación principal.',
    price: 19.99, currency: 'USD', period: 'monthly',
    features: ['Menú Digital con QR', 'Gestión de Platos Ilimitada', 'Pedidos para consumo en el local', 'Reportes de Ventas Simples', 'Soporte por email (respuesta en 48h)'],
    isActive: true, isPublic: true, isPopular: false, order: 2, icon: 'star', color: 'blue', maxUsers: 3, maxProjects: 1, ctaText: 'Elegir Plan Básico',
    mp_preapproval_plan_id: '2c93808490a6994e0190b0728c7301d0',
  },
  {
    slug: 'plan-estandar', name: 'Estándar',
    description: 'La solución ideal para restaurantes en crecimiento que buscan ampliar su presencia online y optimizar su servicio.',
    price: 49.99, currency: 'USD', period: 'monthly',
    features: ['Todo en el Plan Básico', 'Pedidos Online para Domicilio y Recogida', 'Sistema de Reservas integrable en web', 'Personalización de Logo y Colores', 'Reportes Avanzados (platos más vendidos)', 'Soporte por Chat (respuesta en 24h)'],
    isActive: true, isPublic: true, isPopular: true, order: 3, icon: 'dollar', color: 'purple', maxUsers: 10, maxProjects: 1, ctaText: 'Actualizar a Estándar',
    mp_preapproval_plan_id: '2c93808490a6994e0190b072c44801d2',
  },
  {
    slug: 'plan-premium', name: 'Premium',
    description: 'Para restaurantes con alto volumen que requieren herramientas avanzadas de marketing y gestión de equipos.',
    price: 99.99, currency: 'USD', period: 'monthly',
    features: ['Todo en el Plan Premium', 'Herramientas de Fidelización (cupones, puntos)', 'Gestión de Empleados con Roles', 'Integración con Redes Sociales', 'Automatización de Marketing por Email', 'Soporte Prioritario por Chat'],
    isActive: true, isPublic: true, isPopular: false, order: 4, icon: 'users', color: 'green', maxUsers: -1, maxProjects: 1, ctaText: 'Obtener Premium',
    mp_preapproval_plan_id: '2c93808490a6994e0190b072f10501d4',
  },
];


const syncAll = async (userId: string, userEmail: string): Promise<string> => {
  if (!db) {
    throw new Error("La base de datos no está disponible. La sincronización falló.");
  }
  
  try {
    const batch = writeBatch(db);
    let operationsCount = 0;

    // 1. Sincronizar Planes
    console.log('📝 Sincronizando planes por defecto...');
    const plansCollectionRef = collection(db, 'landingPlans');
    for (const planData of examplePlans) {
      const docId = planData.id || planData.slug;
      const docRef = doc(plansCollectionRef, docId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const fullPlanData = {
            ...planData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            updatedBy: userEmail,
        };
        batch.set(docRef, fullPlanData);
        operationsCount++;
      }
    }

    // 2. Sincronizar Configuración de Landing
    console.log('📝 Sincronizando configuración de landing por defecto...');
    const configDocRef = doc(db, 'landing_configs', 'main');
    const configDocSnap = await getDoc(configDocRef);
    if (!configDocSnap.exists()) {
        const defaultConfig = landingConfigService.getDefaultConfig();
        const { id, ...dataToSave } = defaultConfig;
        batch.set(configDocRef, { ...dataToSave, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        operationsCount++;
    }
    
    // 3. Ejecutar el batch si hay operaciones pendientes
    if (operationsCount > 0) {
      await batch.commit();
      return `Sincronización completada. Se crearon ${operationsCount} documentos para asegurar los datos por defecto.`;
    } else {
      return "Todos los datos por defecto ya existían. No se realizaron cambios.";
    }

  } catch (error) {
    console.error('Error durante la sincronización de la base de datos:', error);
    throw new Error('No se pudo completar la sincronización de la base de datos.');
  }
};

async function runSync() {
    console.log("Ejecutando script de sincronización...");
    const message = await syncAll('system-script', 'script@websapmax.com');
    console.log(message);
}

// Ejecutar si se llama directamente con tsx
if (require.main === module) {
    runSync();
}

export const databaseSyncService = {
  syncAll,
};
