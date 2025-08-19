
// src/scripts/create-sample-dishes.js

// Este script se ejecuta con Node.js para poblar la base de datos con platos de ejemplo.
// Uso: npm run seed:dishes

// Importar las funciones necesarias de Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where } = require('firebase/firestore');

// La configuración de Firebase ahora se importa desde el archivo centralizado
// NOTA: Este script no usará dotenv, asumirá que las variables de entorno ya están cargadas en el entorno de ejecución
// o que la configuración se puede obtener de otra manera si es necesario.
// Esto simplifica y evita la dependencia directa de .env.local aquí.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validar que la configuración esté completa
if (!firebaseConfig.projectId) {
    console.error("❌ Error: No se pudo cargar la configuración de Firebase desde las variables de entorno.");
    console.error("Asegúrate de que el entorno de ejecución tenga acceso a las variables NEXT_PUBLIC_FIREBASE_*");
    process.exit(1);
}


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const companyId = 'websapmax'; // ID de la compañía para la que se crearán los platos

const sampleDishes = [
  {
    name: 'Fajitas de Pollo',
    description: 'Tiras de pollo a la parrilla con pimientos y cebollas, servido con tortillas calientes, salsa y guacamole.',
    price: 18.99,
    category: 'Platos Fuertes',
    stock: 50,
    imageUrl: 'https://placehold.co/600x400.png',
    likes: 5,
    available: true,
    isFeatured: true,
  },
  {
    name: 'Pizza Margarita',
    description: 'Pizza clásica con mozzarella fresca, albahaca y una rica salsa de tomate sobre una masa crujiente.',
    price: 14.50,
    category: 'Platos Fuertes',
    stock: -1,
    imageUrl: 'https://placehold.co/600x400.png',
    likes: 4,
    available: true,
    isFeatured: false,
  },
  {
    name: 'Ensalada César',
    description: 'Lechuga romana crujiente, queso parmesano, crutones y un cremoso aderezo César. Añade pollo por $3 extra.',
    price: 9.75,
    category: 'Entradas',
    stock: 100,
    imageUrl: 'https://placehold.co/600x400.png',
    likes: 4,
    available: true,
    isFeatured: false,
  },
  {
    name: 'Torta de Chocolate Fundido',
    description: 'Torta de chocolate tibia con un centro de lava de chocolate, servida con helado de vainilla.',
    price: 8.00,
    category: 'Postres',
    stock: 30,
    imageUrl: 'https://placehold.co/600x400.png',
    likes: 5,
    available: true,
    isFeatured: true,
  },
  {
    name: 'Limonada de Coco',
    description: 'Una refrescante mezcla de limones frescos y crema de coco.',
    price: 6.50,
    category: 'Bebidas',
    stock: -1,
    imageUrl: 'https://placehold.co/600x400.png',
    likes: 5,
    available: true,
    isFeatured: false,
  },
];

async function createSampleDishes() {
  console.log('🚀 Iniciando creación de platos de ejemplo...');

  const dishesCollection = collection(db, 'dishes');
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const dish of sampleDishes) {
    try {
      // Verificar si un plato con el mismo nombre ya existe para esta compañía
      const q = query(dishesCollection, where('name', '==', dish.name), where('companyId', '==', companyId));
      const existingDishes = await getDocs(q);

      if (!existingDishes.empty) {
        console.log(`🟡 Plato "${dish.name}" ya existe. Omitiendo.`);
        skippedCount++;
        continue;
      }

      const dishData = {
        ...dish,
        companyId: companyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(dishesCollection, dishData);
      console.log(`✅ Plato "${dish.name}" creado exitosamente.`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error creando plato "${dish.name}":`, error);
      errorCount++;
    }
  }

  console.log('🎉 Proceso completado!');
  console.log(`👍 Platos creados: ${successCount}`);
  console.log(`🟡 Platos omitidos (ya existían): ${skippedCount}`);
  if (errorCount > 0) {
    console.log(`👎 Errores: ${errorCount}`);
  }
}

// Ejecutar la función principal y luego salir del proceso
createSampleDishes().then(() => {
    console.log("Script finalizado.");
    process.exit(0);
}).catch(error => {
    console.error("El script falló con un error:", error);
    process.exit(1);
});
