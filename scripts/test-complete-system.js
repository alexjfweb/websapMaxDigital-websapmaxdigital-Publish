// Script completo para probar el sistema de planes de suscripción
// Ejecutar en la consola del navegador

console.log('🧪 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA DE PLANES');
console.log('=' .repeat(60));

// Función para esperar
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para probar la API de planes
async function testPlansAPI() {
  console.log('\n📡 PRUEBA 1: API de Planes');
  console.log('-'.repeat(40));
  
  try {
    // GET /api/landing-plans
    console.log('🔄 Probando GET /api/landing-plans...');
    const response = await fetch('/api/landing-plans');
    const plans = await response.json();
    
    console.log(`✅ GET exitoso: ${plans.length} planes obtenidos`);
    plans.forEach(plan => {
      console.log(`  📋 ${plan.name} - $${plan.price} ${plan.currency}`);
    });
    
    return plans;
  } catch (error) {
    console.error('❌ Error en GET /api/landing-plans:', error);
    return [];
  }
}

// Función para crear un plan de prueba
async function createTestPlan() {
  console.log('\n➕ PRUEBA 2: Crear Plan de Prueba');
  console.log('-'.repeat(40));
  
  const testPlan = {
    name: 'Plan de Prueba',
    description: 'Plan creado para probar el sistema',
    price: 49.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Característica 1',
      'Característica 2',
      'Característica 3'
    ],
    isActive: true,
    isPopular: false,
    icon: 'star',
    color: 'purple',
    maxUsers: 10,
    maxProjects: 20,
    ctaText: 'Probar Ahora'
  };
  
  try {
    console.log('🔄 Creando plan de prueba...');
    const response = await fetch('/api/landing-plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...testPlan,
        userId: 'superadmin',
        userEmail: 'admin@websapmax.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Script de prueba'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Plan creado exitosamente:', result);
      return result;
    } else {
      console.error('❌ Error creando plan:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Error en la petición:', error);
    return null;
  }
}

// Función para actualizar un plan
async function updateTestPlan(planId) {
  console.log('\n✏️ PRUEBA 3: Actualizar Plan');
  console.log('-'.repeat(40));
  
  const updateData = {
    name: 'Plan de Prueba Actualizado',
    description: 'Plan actualizado para probar el sistema',
    price: 59.99,
    features: [
      'Característica 1 actualizada',
      'Característica 2 actualizada',
      'Nueva característica'
    ],
    isPopular: true
  };
  
  try {
    console.log('🔄 Actualizando plan...');
    const response = await fetch(`/api/landing-plans/${planId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updateData,
        userId: 'superadmin',
        userEmail: 'admin@websapmax.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Script de prueba'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Plan actualizado exitosamente:', result);
      return result;
    } else {
      console.error('❌ Error actualizando plan:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Error en la petición:', error);
    return null;
  }
}

// Función para obtener historial de auditoría
async function testAuditLogs(planId) {
  console.log('\n📋 PRUEBA 4: Historial de Auditoría');
  console.log('-'.repeat(40));
  
  try {
    console.log('🔄 Obteniendo historial de auditoría...');
    const response = await fetch(`/api/landing-plans/${planId}/audit`);
    const logs = await response.json();
    
    console.log(`✅ Historial obtenido: ${logs.length} registros`);
    logs.forEach((log, index) => {
      console.log(`  📝 ${index + 1}. ${log.action} - ${new Date(log.timestamp).toLocaleString()}`);
    });
    
    return logs;
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    return [];
  }
}

// Función para probar reordenamiento
async function testReorder(plans) {
  console.log('\n🔄 PRUEBA 5: Reordenamiento');
  console.log('-'.repeat(40));
  
  if (plans.length < 2) {
    console.log('⚠️ Se necesitan al menos 2 planes para probar reordenamiento');
    return false;
  }
  
  try {
    console.log('🔄 Reordenando planes...');
    const planIds = plans.map(p => p.id);
    // Intercambiar el primer y segundo plan
    [planIds[0], planIds[1]] = [planIds[1], planIds[0]];
    
    const response = await fetch('/api/landing-plans/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planIds,
        userId: 'superadmin',
        userEmail: 'admin@websapmax.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Script de prueba'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Planes reordenados exitosamente');
      return true;
    } else {
      console.error('❌ Error reordenando planes:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en la petición:', error);
    return false;
  }
}

// Función principal para ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas completas...\n');
  
  // Prueba 1: Obtener planes
  const initialPlans = await testPlansAPI();
  await wait(1000);
  
  // Prueba 2: Crear plan
  const newPlan = await createTestPlan();
  await wait(1000);
  
  if (newPlan) {
    // Prueba 3: Actualizar plan
    const updatedPlan = await updateTestPlan(newPlan.id);
    await wait(1000);
    
    // Prueba 4: Historial de auditoría
    await testAuditLogs(newPlan.id);
    await wait(1000);
  }
  
  // Prueba 5: Reordenamiento
  const currentPlans = await testPlansAPI();
  await testReorder(currentPlans);
  await wait(1000);
  
  // Verificación final
  console.log('\n🎯 VERIFICACIÓN FINAL');
  console.log('='.repeat(60));
  const finalPlans = await testPlansAPI();
  
  console.log('\n✅ PRUEBAS COMPLETADAS');
  console.log('📊 Resumen:');
  console.log(`  - Planes totales: ${finalPlans.length}`);
  console.log(`  - Planes activos: ${finalPlans.filter(p => p.isActive).length}`);
  console.log(`  - Planes populares: ${finalPlans.filter(p => p.isPopular).length}`);
  
  console.log('\n🌐 Próximos pasos:');
  console.log('  1. Ve a la página principal para ver los planes');
  console.log('  2. Ve a /superadmin/subscription-plans para gestionar');
  console.log('  3. Prueba crear, editar y eliminar planes desde la UI');
  
  return finalPlans;
}

// Función para limpiar datos de prueba
async function cleanupTestData() {
  console.log('\n🧹 LIMPIANDO DATOS DE PRUEBA');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('/api/landing-plans');
    const plans = await response.json();
    
    const testPlans = plans.filter(p => 
      p.name.includes('Prueba') || 
      p.name.includes('Test') ||
      p.description.includes('prueba')
    );
    
    console.log(`🔄 Eliminando ${testPlans.length} planes de prueba...`);
    
    for (const plan of testPlans) {
      try {
        await fetch(`/api/landing-plans/${plan.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'superadmin',
            userEmail: 'admin@websapmax.com',
            ipAddress: '127.0.0.1',
            userAgent: 'Script de limpieza'
          })
        });
        console.log(`  ✅ Eliminado: ${plan.name}`);
      } catch (error) {
        console.log(`  ❌ Error eliminando ${plan.name}:`, error);
      }
      await wait(500);
    }
    
    console.log('✅ Limpieza completada');
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
  }
}

// Exportar funciones para uso manual
window.testSystem = {
  runAllTests,
  testPlansAPI,
  createTestPlan,
  updateTestPlan,
  testAuditLogs,
  testReorder,
  cleanupTestData
};

console.log('💡 Comandos disponibles:');
console.log('  - testSystem.runAllTests() - Ejecutar todas las pruebas');
console.log('  - testSystem.cleanupTestData() - Limpiar datos de prueba');
console.log('  - testSystem.testPlansAPI() - Probar solo la API');

// Ejecutar automáticamente si no hay planes
console.log('\n🔍 Verificando estado inicial...');
testPlansAPI().then(plans => {
  if (plans.length === 0) {
    console.log('📝 No hay planes. Ejecutando pruebas automáticamente...');
    runAllTests();
  } else {
    console.log('✅ Ya hay planes en el sistema. Usa testSystem.runAllTests() para ejecutar pruebas.');
  }
}); 