"use client";

// Script para crear platos de ejemplo en Firestore.
// Para usarlo:
// 1. Ve a la página de gestión de platos en el panel de administración.
// 2. Abre la consola del navegador (F12 o Cmd+Option+I).
// 3. Pega el contenido de este archivo en la consola y presiona Enter.
// 4. Llama a la función `createSampleDishes()` para iniciar la creación.

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

  // Esto requiere que tengas `db` (la instancia de Firestore) disponible en el contexto de la ventana.
  // Asegúrate de que tu aplicación exponga `db` a `window` para poder usar este script,
  // por ejemplo: `window.db = db;` en algún lugar de tu código de inicialización de Firebase.
  if (typeof window.db === 'undefined') {
    console.error('❌ Error: La instancia de Firestore `db` no está disponible en `window`.');
    console.log('Asegúrate de exponerla para poder usar este script de prueba.');
    return;
  }
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

  let successCount = 0;
  let errorCount = 0;

  for (const dish of sampleDishes) {
    try {
      const dishData = {
        ...dish,
        companyId: companyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(window.db, 'dishes'), dishData);
      console.log(`✅ Plato "${dish.name}" creado exitosamente.`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error creando plato "${dish.name}":`, error);
      errorCount++;
    }
    // Pequeña pausa para no sobrecargar Firestore
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('🎉 Proceso completado!');
  console.log(`👍 Platos creados: ${successCount}`);
  if (errorCount > 0) {
    console.log(`👎 Errores: ${errorCount}`);
  }
}

// Para facilitar el uso, puedes adjuntar la función a la ventana
window.createSampleDishes = createSampleDishes;

console.log('💡 Script de platos de ejemplo cargado. Llama a `createSampleDishes()` para ejecutarlo.');
