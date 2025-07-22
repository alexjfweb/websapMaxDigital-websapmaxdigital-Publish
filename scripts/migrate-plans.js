const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  deleteDoc, 
  addDoc, 
  writeBatch,
  serverTimestamp 
} = require('firebase/firestore');

// Configuración de Firebase (usar las mismas variables de entorno)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos de ejemplo para los planes
const samplePlans = [
  {
    slug: 'basico',
    name: 'Plan Básico',
    description: 'Perfecto para pequeñas empresas que están comenzando',
    price: 29.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Hasta 5 usuarios',
      '10 proyectos activos',
      'Soporte por email',
      'Actualizaciones básicas',
      'Almacenamiento de 10GB'
    ],
    isActive: true,
    isPopular: false,
    order: 1,
    icon: 'zap',
    color: 'blue',
    maxUsers: 5,
    maxProjects: 10,
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    slug: 'profesional',
    name: 'Plan Profesional',
    description: 'Ideal para equipos en crecimiento',
    price: 79.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Hasta 25 usuarios',
      '50 proyectos activos',
      'Soporte prioritario',
      'Actualizaciones automáticas',
      'Almacenamiento de 100GB',
      'Integraciones avanzadas',
      'Reportes detallados'
    ],
    isActive: true,
    isPopular: true,
    order: 2,
    icon: 'star',
    color: 'purple',
    maxUsers: 25,
    maxProjects: 50,
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    slug: 'empresarial',
    name: 'Plan Empresarial',
    description: 'Para grandes organizaciones con necesidades complejas',
    price: 199.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Usuarios ilimitados',
      'Proyectos ilimitados',
      'Soporte telefónico 24/7',
      'Actualizaciones prioritarias',
      'Almacenamiento ilimitado',
      'Integraciones personalizadas',
      'Reportes avanzados',
      'API dedicada',
      'SLA garantizado'
    ],
    isActive: true,
    isPopular: false,
    order: 3,
    icon: 'dollar',
    color: 'green',
    maxUsers: null,
    maxProjects: null,
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    slug: 'anual-basico',
    name: 'Plan Básico Anual',
    description: 'Plan básico con descuento anual',
    price: 299.99,
    currency: 'USD',
    period: 'yearly',
    features: [
      'Hasta 5 usuarios',
      '10 proyectos activos',
      'Soporte por email',
      'Actualizaciones básicas',
      'Almacenamiento de 10GB',
      '2 meses gratis'
    ],
    isActive: true,
    isPopular: false,
    order: 4,
    icon: 'calendar',
    color: 'orange',
    maxUsers: 5,
    maxProjects: 10,
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    slug: 'lifetime',
    name: 'Plan de Por Vida',
    description: 'Acceso permanente a todas las funciones',
    price: 999.99,
    currency: 'USD',
    period: 'lifetime',
    features: [
      'Usuarios ilimitados',
      'Proyectos ilimitados',
      'Soporte premium de por vida',
      'Todas las actualizaciones futuras',
      'Almacenamiento ilimitado',
      'Todas las integraciones',
      'Reportes avanzados',
      'API dedicada',
      'SLA garantizado',
      'Pago único'
    ],
    isActive: true,
    isPopular: false,
    order: 5,
    icon: 'star',
    color: 'indigo',
    maxUsers: null,
    maxProjects: null,
    createdBy: 'system',
    updatedBy: 'system'
  }
];

async function migratePlans() {
  console.log('🚀 Iniciando migración de planes...');

  try {
    // 1. Limpiar datos antiguos
    console.log('📝 Limpiando datos antiguos...');
    
    // Eliminar planes antiguos
    const oldPlansSnapshot = await getDocs(collection(db, 'landingPlans'));
    const oldPlansBatch = writeBatch(db);
    
    oldPlansSnapshot.forEach((doc) => {
      oldPlansBatch.delete(doc.ref);
    });
    
    await oldPlansBatch.commit();
    console.log(`✅ Eliminados ${oldPlansSnapshot.size} planes antiguos`);

    // Eliminar historial antiguo
    const oldHistorySnapshot = await getDocs(collection(db, 'planHistory'));
    const oldHistoryBatch = writeBatch(db);
    
    oldHistorySnapshot.forEach((doc) => {
      oldHistoryBatch.delete(doc.ref);
    });
    
    await oldHistoryBatch.commit();
    console.log(`✅ Eliminado historial antiguo`);

    // 2. Crear nuevos planes
    console.log('📝 Creando nuevos planes...');
    
    const plansBatch = writeBatch(db);
    
    for (const planData of samplePlans) {
      const planRef = doc(collection(db, 'plans'));
      plansBatch.set(planRef, {
        ...planData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    await plansBatch.commit();
    console.log(`✅ Creados ${samplePlans.length} planes nuevos`);

    // 3. Crear entradas de historial inicial
    console.log('📝 Creando historial inicial...');
    
    const historyBatch = writeBatch(db);
    
    for (const planData of samplePlans) {
      const historyRef = doc(collection(db, 'planHistory'));
      historyBatch.set(historyRef, {
        planId: planData.slug, // Usar slug como ID temporal
        action: 'created',
        previousData: null,
        newData: planData,
        userId: 'system',
        userEmail: 'system@websapmax.com',
        timestamp: serverTimestamp(),
        reason: 'Migración inicial',
        ipAddress: 'system'
      });
    }
    
    await historyBatch.commit();
    console.log(`✅ Creado historial inicial para ${samplePlans.length} planes`);

    // 4. Crear logs de auditoría
    console.log('📝 Creando logs de auditoría...');
    
    const auditBatch = writeBatch(db);
    
    for (const planData of samplePlans) {
      const auditRef = doc(collection(db, 'planAuditLogs'));
      auditBatch.set(auditRef, {
        planId: planData.slug,
        action: 'create_plan',
        userId: 'system',
        userEmail: 'system@websapmax.com',
        timestamp: serverTimestamp(),
        details: {
          planData,
          action: 'plan_created_migration'
        },
        ipAddress: 'system',
        userAgent: 'migration-script'
      });
    }
    
    await auditBatch.commit();
    console.log(`✅ Creados logs de auditoría para ${samplePlans.length} planes`);

    console.log('🎉 Migración completada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Planes eliminados: ${oldPlansSnapshot.size}`);
    console.log(`   - Planes creados: ${samplePlans.length}`);
    console.log(`   - Entradas de historial: ${samplePlans.length}`);
    console.log(`   - Logs de auditoría: ${samplePlans.length}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migratePlans();
}

module.exports = { migratePlans }; 