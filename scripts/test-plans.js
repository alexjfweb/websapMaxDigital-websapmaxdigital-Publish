// Script para probar el sistema de planes
// Ejecutar en la consola del navegador

console.log('🧪 Iniciando pruebas del sistema de planes...');

// Función para probar la API
async function testPlansAPI() {
  try {
    console.log('📡 Probando API de planes...');
    
    // GET /api/landing-plans
    const response = await fetch('/api/landing-plans');
    const plans = await response.json();
    
    console.log(`✅ API GET /api/landing-plans: ${plans.length} planes obtenidos`);
    console.log('📋 Planes:', plans);
    
    return plans;
  } catch (error) {
    console.error('❌ Error probando API:', error);
    return [];
  }
}

// Función para crear un plan de prueba
async function createTestPlan() {
  try {
    console.log('➕ Creando plan de prueba...');
    
    const testPlan = {
      name: 'Plan de Prueba',
      description: 'Este es un plan de prueba para verificar el sistema',
      price: 29.99,
      currency: 'USD',
      period: 'monthly',
      features: [
        'Característica 1',
        'Característica 2',
        'Característica 3'
      ],
      isActive: true,
      isPopular: false,
      icon: 'zap',
      color: 'blue',
      maxUsers: 5,
      maxProjects: 10,
      ctaText: 'Comenzar Prueba',
      userId: 'test-user',
      userEmail: 'test@example.com'
    };
    
    const response = await fetch('/api/landing-plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPlan)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Plan de prueba creado:', result);
      return result;
    } else {
      const error = await response.json();
      console.error('❌ Error creando plan:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error en createTestPlan:', error);
    return null;
  }
}

// Función para limpiar planes de prueba
async function cleanupTestPlans() {
  try {
    console.log('🧹 Limpiando planes de prueba...');
    
    const response = await fetch('/api/landing-plans', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user',
        userEmail: 'test@example.com'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Planes eliminados:', result);
    } else {
      const error = await response.json();
      console.error('❌ Error eliminando planes:', error);
    }
  } catch (error) {
    console.error('❌ Error en cleanupTestPlans:', error);
  }
}

// Función principal de pruebas
async function runTests() {
  console.log('🚀 Iniciando suite de pruebas...');
  
  // 1. Probar API GET
  const initialPlans = await testPlansAPI();
  
  // 2. Crear plan de prueba
  const newPlan = await createTestPlan();
  
  // 3. Verificar que se creó
  if (newPlan) {
    const updatedPlans = await testPlansAPI();
    console.log(`📊 Planes antes: ${initialPlans.length}, después: ${updatedPlans.length}`);
  }
  
  // 4. Limpiar
  await cleanupTestPlans();
  
  console.log('🎉 Pruebas completadas!');
}

// Exportar funciones para uso en consola
window.testPlansAPI = testPlansAPI;
window.createTestPlan = createTestPlan;
window.cleanupTestPlans = cleanupTestPlans;
window.runTests = runTests;

console.log('📝 Script de pruebas cargado!');
console.log('Comandos disponibles:');
console.log('- runTests() - Ejecutar todas las pruebas');
console.log('- testPlansAPI() - Probar solo la API GET');
console.log('- createTestPlan() - Crear un plan de prueba');
console.log('- cleanupTestPlans() - Limpiar planes de prueba'); 