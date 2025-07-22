const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase (usar las mismas variables de entorno)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'websapmax.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'websapmax',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'websapmax.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '560613070255',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:560613070255:web:7ce75870dbe6b19a084b5a',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Planes de ejemplo
const examplePlans = [
  {
    slug: 'basico',
    name: 'Básico',
    description: 'Perfecto para pequeñas empresas que están comenzando',
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
    isPublic: true, // Asegurar que es público
    isPopular: false,
    order: 1,
    icon: 'zap',
    color: 'blue',
    maxUsers: 5,
    maxProjects: 10,
    ctaText: 'Comenzar Prueba Gratuita',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    slug: 'profesional',
    name: 'Profesional',
    description: 'Ideal para equipos en crecimiento que necesitan más funcionalidades',
    price: 79.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Hasta 25 usuarios',
      'Todas las funciones del plan básico',
      'Soporte prioritario',
      'Integraciones avanzadas',
      'Reportes detallados',
      'Personalización avanzada',
      'API de acceso',
      'Backup automático'
    ],
    isActive: true,
    isPublic: true, // Asegurar que es público
    isPopular: true,
    order: 2,
    icon: 'star',
    color: 'purple',
    maxUsers: 25,
    maxProjects: 50,
    ctaText: 'Comenzar Prueba Gratuita',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    slug: 'empresarial',
    name: 'Empresarial',
    description: 'Para grandes organizaciones que requieren máxima funcionalidad y soporte',
    price: 199.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Usuarios ilimitados',
      'Todas las funciones del plan profesional',
      'Soporte 24/7 con chat en vivo',
      'API personalizada',
      'SLA garantizado del 99.9%',
      'Onboarding dedicado',
      'Capacitación personalizada',
      'Integraciones personalizadas',
      'Análisis avanzado',
      'Compliance y seguridad empresarial'
    ],
    isActive: true,
    isPublic: true, // Asegurar que es público
    isPopular: false,
    order: 3,
    icon: 'dollar',
    color: 'green',
    maxUsers: -1,
    maxProjects: -1,
    ctaText: 'Contactar Ventas',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    slug: 'startup',
    name: 'Startup',
    description: 'Plan especial para startups con descuento significativo',
    price: 49.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Hasta 15 usuarios',
      'Funciones profesionales',
      'Soporte por email y chat',
      'Integraciones básicas',
      'Reportes estándar',
      'Descuento del 40% para startups',
      'Validación de startup requerida'
    ],
    isActive: true,
    isPublic: true, // Asegurar que es público
    isPopular: false,
    order: 4,
    icon: 'users',
    color: 'orange',
    maxUsers: 15,
    maxProjects: 25,
    ctaText: 'Aplicar como Startup',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    slug: 'anual-basico',
    name: 'Básico Anual',
    description: 'Plan básico con descuento por pago anual',
    price: 299.99,
    currency: 'USD',
    period: 'yearly',
    features: [
      'Hasta 5 usuarios',
      'Funciones básicas de gestión',
      'Soporte por email',
      'Actualizaciones gratuitas',
      'Acceso a plantillas básicas',
      'Ahorro del 17% vs plan mensual'
    ],
    isActive: true,
    isPublic: true, // Asegurar que es público
    isPopular: false,
    order: 5,
    icon: 'calendar',
    color: 'indigo',
    maxUsers: 5,
    maxProjects: 10,
    ctaText: 'Ahorrar 17%',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: 'system',
    updatedBy: 'system'
  }
];

// Logs de auditoría de ejemplo
const exampleAuditLogs = [
  {
    planId: 'basico-plan',
    action: 'created',
    userId: 'system',
    userEmail: 'system@websapmax.com',
    timestamp: new Date(),
    details: {
      migration: true,
      source: 'migration-script',
      version: '1.0.0'
    },
    ipAddress: 'localhost',
    userAgent: 'migration-script'
  }
];

async function migratePlans() {
  console.log('🚀 Iniciando migración de planes de suscripción...');
  
  try {
    const plansCollection = collection(db, 'landingPlans');
    const auditCollection = collection(db, 'planAuditLogs');
    
    console.log('📝 Creando planes de ejemplo...');
    
    for (const plan of examplePlans) {
      try {
        const docRef = await addDoc(plansCollection, plan);
        console.log(`✅ Plan creado: ${plan.name} (ID: ${docRef.id})`);
        
        // Crear log de auditoría para cada plan
        const auditLog = {
          planId: docRef.id,
          action: 'created',
          userId: 'system',
          userEmail: 'system@websapmax.com',
          timestamp: new Date(),
          details: {
            migration: true,
            source: 'migration-script',
            version: '1.0.0',
            planName: plan.name
          },
          ipAddress: 'localhost',
          userAgent: 'migration-script'
        };
        
        await addDoc(auditCollection, auditLog);
        console.log(`📋 Log de auditoría creado para: ${plan.name}`);
        
      } catch (error) {
        console.error(`❌ Error creando plan ${plan.name}:`, error.message);
      }
    }
    
    console.log('🎉 Migración completada exitosamente!');
    console.log(`📊 Se crearon ${examplePlans.length} planes de ejemplo`);
    console.log('🔗 Los planes ya están disponibles en la landing page');
    console.log('⚙️  Puedes gestionarlos desde: /superadmin/subscription-plans');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migratePlans()
    .then(() => {
      console.log('✅ Script de migración finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script de migración:', error);
      process.exit(1);
    });
}

module.exports = { migratePlans, examplePlans };
