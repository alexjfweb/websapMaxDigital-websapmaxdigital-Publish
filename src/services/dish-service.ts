
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { Dish } from '@/types';

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


class DishService {
  private get dishesCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'dishes'.");
      return null;
    }
    return collection(db, 'dishes');
  }

  /**
   * Crea un conjunto de platos de ejemplo para una nueva compañía.
   * @param companyId El ID de la compañía a la que se asociarán los platos.
   */
  async createSampleDishesForCompany(companyId: string): Promise<void> {
    const coll = this.dishesCollection;
    if (!coll) {
      console.error("No se pueden crear platos de ejemplo: la base de datos no está disponible.");
      return;
    }
    
    console.log(`🥣 Creando platos de ejemplo para la compañía: ${companyId}`);
    const promises = sampleDishes.map(dish => {
      const dishData = {
        ...dish,
        companyId: companyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      return addDoc(coll, dishData);
    });

    try {
      await Promise.all(promises);
      console.log(`✅ ${sampleDishes.length} platos de ejemplo creados exitosamente para la compañía ${companyId}.`);
    } catch (error) {
      console.error(`❌ Error al crear los platos de ejemplo para la compañía ${companyId}:`, error);
      // No relanzamos el error para no interrumpir el flujo de registro del usuario.
    }
  }


  /**
   * Obtiene todos los platos activos de una compañía específica.
   * Valida que cada plato tenga los campos esenciales.
   * @param companyId - El ID de la compañía.
   * @returns Un array de objetos Dish.
   */
  async getDishesByCompany(companyId: string): Promise<Dish[]> {
    const coll = this.dishesCollection;
    if (!coll) return [];
    
    try {
      const q = query(
        coll,
        where('companyId', '==', companyId),
        where('available', '==', true) // Asumiendo 'available' en lugar de 'isActive' para platos
      );

      const querySnapshot = await getDocs(q);
      const dishes: Dish[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        // Validación de campos esenciales
        if (!data.name || typeof data.price !== 'number' || !data.createdAt) {
          console.warn(`[WARN] Documento de plato ${doc.id} omitido por datos incompletos.`);
          return;
        }

        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();

        dishes.push({
          id: doc.id,
          name: data.name,
          description: data.description || '',
          price: data.price,
          imageUrl: data.imageUrl || 'https://placehold.co/800x450.png',
          stock: data.stock ?? -1,
          likes: data.likes ?? 0,
          category: data.category || 'Sin categoría',
          isFeatured: data.isFeatured ?? false,
          // Asegurando que los campos validados estén presentes
          companyId: data.companyId,
          available: data.available,
          createdAt: createdAt.toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString() || createdAt.toISOString(),
        } as any); // Usamos 'any' para evitar problemas de tipo con la conversión de Timestamp
      });
      
      console.log(`✅ Se obtuvieron ${dishes.length} platos para la compañía ${companyId}.`);
      return dishes;
    } catch (error) {
      console.error(`❌ Error al obtener los platos para la compañía ${companyId}:`, error);
      throw new Error('No se pudieron obtener los platos.');
    }
  }
}

export const dishService = new DishService();
