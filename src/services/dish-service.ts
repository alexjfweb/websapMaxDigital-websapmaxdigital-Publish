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

// --- DATOS DE EJEMPLO ---
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

// --- FUNCIÓN DE SERIALIZACIÓN ROBUSTA ---
const serializeDate = (date: any): string => {
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') {
    const d = new Date(date);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  if (date && typeof date.seconds === 'number') {
    return new Date(date.seconds * 1000).toISOString();
  }
  // Si no hay fecha, devuelve la fecha actual como string
  return new Date().toISOString();
};

const serializeDish = (id: string, data: any): Dish => {
  return {
    id,
    name: data.name || 'Sin Nombre',
    description: data.description || '',
    price: data.price || 0,
    imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
    stock: data.stock ?? -1,
    likes: data.likes ?? 0,
    category: data.category || 'Sin categoría',
    isFeatured: data.isFeatured ?? false,
    companyId: data.companyId,
    available: data.available ?? true,
    createdAt: serializeDate(data.createdAt),
    updatedAt: serializeDate(data.updatedAt),
  };
};

class DishService {
  private getDishesCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'dishes'.");
      throw new Error("La base de datos no está disponible.");
    }
    return collection(db, 'dishes');
  }

  async createSampleDishesForCompany(companyId: string): Promise<void> {
    const coll = this.getDishesCollection();
    const timestamp = serverTimestamp();
    const promises = sampleDishes.map(dish => {
      const dishData = {
        ...dish,
        companyId: companyId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      return addDoc(coll, dishData);
    });

    try {
      await Promise.all(promises);
      console.log(`✅ Platos de ejemplo creados para la compañía ${companyId}`);
    } catch (error) {
      console.error(`Error creando platos de ejemplo para ${companyId}:`, error);
      // No relanzar para no interrumpir flujos críticos si solo falla esto.
    }
  }

  async getDishesByCompany(companyId: string): Promise<Dish[]> {
    if (!companyId) return [];
    
    try {
      const coll = this.getDishesCollection();
      const q = query(coll, where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => serializeDish(doc.id, doc.data()));
    } catch (error) {
      console.error(`Error obteniendo platos para la compañía ${companyId}:`, error);
      throw new Error('No se pudieron obtener los platos.');
    }
  }
}

export const dishService = new DishService();
