// Este script es para ser ejecutado manualmente si es necesario.
// El sistema ahora se basa principalmente en el endpoint /api/sync-database

const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { databaseSyncService } = require('../services/database-sync-service'); // Ajustar ruta si es necesario

// Cargar variables de entorno para ejecución local
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function runSync() {
  console.log('🔧 Ejecutando script de sincronización manual...');
  
  if (!firebaseConfig.projectId) {
    console.error('❌ Error: Configuración de Firebase no encontrada. Asegúrate de que tu archivo .env.local está configurado.');
    process.exit(1);
  }

  // Inicializa Firebase para poder usar los servicios
  initializeApp(firebaseConfig);
  
  const mockUser = { id: 'manual-script-runner', email: 'script@websapmax.com' };

  try {
    const message = await databaseSyncService.syncAll(mockUser.id, mockUser.email);
    console.log(`✅ Éxito: ${message}`);
  } catch (error) {
    console.error('❌ Falló la sincronización manual:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSync().then(() => process.exit(0));
}
