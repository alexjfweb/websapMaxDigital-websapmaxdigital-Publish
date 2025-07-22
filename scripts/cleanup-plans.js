// Script para limpiar planes duplicados en Firebase
// Uso: node scripts/cleanup-plans.js

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  writeBatch,
  query,
  orderBy 
} = require('firebase/firestore');

// Configuración de Firebase (usar variables de entorno)
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

async function cleanupDuplicatePlans() {
  console.log('🧹 Iniciando limpieza de planes duplicados...');
  
  try {
    // Obtener todos los planes
    const q = query(collection(db, "landingPlans"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('✅ No hay planes para limpiar');
      return;
    }
    
    const allPlans = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Total de planes encontrados: ${allPlans.length}`);
    
    // Agrupar por nombre
    const nameCounts = {};
    allPlans.forEach(plan => {
      if (!nameCounts[plan.name]) {
        nameCounts[plan.name] = [];
      }
      nameCounts[plan.name].push(plan);
    });
    
    // Encontrar duplicados
    const duplicates = Object.entries(nameCounts)
      .filter(([name, plans]) => plans.length > 1)
      .map(([name, plans]) => ({ name, plans }));
    
    if (duplicates.length === 0) {
      console.log('✅ No se encontraron planes duplicados');
      return;
    }
    
    console.log(`🚨 Encontrados ${duplicates.length} grupos de duplicados:`);
    duplicates.forEach(({ name, plans }) => {
      console.log(`   - "${name}": ${plans.length} copias`);
    });
    
    // Eliminar duplicados (mantener el más reciente)
    const batch = writeBatch(db);
    let deletedCount = 0;
    
    duplicates.forEach(({ name, plans }) => {
      // Ordenar por updatedAt y mantener solo el más reciente
      const sortedPlans = plans.sort((a, b) => {
        const aTime = new Date(a.updatedAt || 0).getTime();
        const bTime = new Date(b.updatedAt || 0).getTime();
        return bTime - aTime;
      });
      
      // Eliminar todos excepto el primero (más reciente)
      sortedPlans.slice(1).forEach(plan => {
        const docRef = doc(db, "landingPlans", plan.id);
        batch.delete(docRef);
        deletedCount++;
        console.log(`   🗑️  Eliminando duplicado: ${plan.name} (ID: ${plan.id})`);
      });
    });
    
    await batch.commit();
    
    console.log(`✅ Limpieza completada. ${deletedCount} planes duplicados eliminados.`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  }
}

// Ejecutar limpieza
if (require.main === module) {
  cleanupDuplicatePlans()
    .then(() => {
      console.log('🎉 Script de limpieza completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script de limpieza:', error);
      process.exit(1);
    });
}

module.exports = { cleanupDuplicatePlans }; 