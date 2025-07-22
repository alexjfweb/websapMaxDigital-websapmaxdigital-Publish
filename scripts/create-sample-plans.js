// Script para crear planes de ejemplo directamente en la consola del navegador
// Ejecutar en la consola del navegador cuando estés en la página de superadmin

console.log('🚀 Iniciando creación de planes de ejemplo...');

const samplePlans = [
  {
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
    isPopular: false,
    order: 1,
    icon: 'zap',
    color: 'blue',
    maxUsers: 5,
    maxProjects: 10,
    ctaText: 'Comenzar Prueba Gratuita'
  },
  {
    name: 'Profesional',
    description: 'Ideal para empresas en crecimiento con necesidades avanzadas',
    price: 79.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Hasta 25 usuarios',
      'Funciones avanzadas de gestión',
      'Soporte prioritario',
      'Integraciones personalizadas',
      'Reportes detallados',
      'API completa'
    ],
    isActive: true,
    isPopular: true,
    order: 2,
    icon: 'star',
    color: 'purple',
    maxUsers: 25,
    maxProjects: 50,
    ctaText: 'Comenzar Prueba Gratuita'
  },
  {
    name: 'Empresarial',
    description: 'Solución completa para grandes organizaciones',
    price: 199.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Usuarios ilimitados',
      'Todas las funciones premium',
      'Soporte 24/7',
      'Implementación personalizada',
      'SLA garantizado',
      'Integración con sistemas empresariales'
    ],
    isActive: true,
    isPopular: false,
    order: 3,
    icon: 'crown',
    color: 'gold',
    maxUsers: -1, // Ilimitado
    maxProjects: -1, // Ilimitado
    ctaText: 'Contactar Ventas'
  }
];

// Función para crear un plan
async function createPlan(planData) {
  try {
    const response = await fetch('/api/landing-plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...planData,
        userId: 'superadmin',
        userEmail: 'admin@websapmax.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Script de prueba'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Plan "${planData.name}" creado exitosamente:`, result);
      return result;
    } else {
      console.error(`❌ Error creando plan "${planData.name}":`, result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error en la petición para "${planData.name}":`, error);
    return null;
  }
}

// Función para crear todos los planes
async function createAllPlans() {
  console.log('📝 Creando planes de ejemplo...');
  
  const results = [];
  
  for (const plan of samplePlans) {
    console.log(`🔄 Creando plan: ${plan.name}`);
    const result = await createPlan(plan);
    results.push(result);
    
    // Esperar un poco entre cada creación
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 Proceso completado!');
  console.log('📊 Resultados:', results);
  
  return results;
}

// Función para verificar planes existentes
async function checkExistingPlans() {
  try {
    const response = await fetch('/api/landing-plans');
    const plans = await response.json();
    
    console.log(`📋 Planes existentes: ${plans.length}`);
    plans.forEach(plan => {
      console.log(`  - ${plan.name} (${plan.price} ${plan.currency})`);
    });
    
    return plans;
  } catch (error) {
    console.error('❌ Error verificando planes:', error);
    return [];
  }
}

// Ejecutar automáticamente
console.log('🔍 Verificando planes existentes...');
checkExistingPlans().then(existingPlans => {
  if (existingPlans.length === 0) {
    console.log('📝 No hay planes existentes. Creando planes de ejemplo...');
    createAllPlans();
  } else {
    console.log('✅ Ya existen planes en el sistema.');
  }
});

// Exportar funciones para uso manual
window.createSamplePlans = {
  createPlan,
  createAllPlans,
  checkExistingPlans,
  samplePlans
};

console.log('💡 Usa window.createSamplePlans para acceder a las funciones manualmente'); 