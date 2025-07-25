
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import type { Dish } from '@/types';

class DishService {
  private get dishesCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'dishes'.");
      return null;
    }
    return collection(db, 'dishes');
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
