
import { getDb } from '@/lib/firebase'; // Usar la instancia centralizada y diferida
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
import { serializeDate } from '@/lib/utils';


// El servicio ahora contiene la lógica de Firestore directamente.
class DishService {

  private get dishesCollection() {
    const db = getDb();
    return collection(db, 'dishes');
  }

  async getDishesByCompany(companyId: string): Promise<Dish[]> {
    if (!companyId) {
      console.warn("[DishService] Se requiere un ID de compañía para obtener los platos.");
      return [];
    }

    try {
      // Consulta directa a Firestore
      const q = query(this.dishesCollection, where('companyId', '==', companyId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return [];
      }

      // Mapear y serializar los documentos
      const dishes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: serializeDate(data.createdAt),
          updatedAt: serializeDate(data.updatedAt),
        } as Dish;
      });
      
      return dishes;

    } catch (error) {
      console.error(`[DishService] Error al obtener platos para la compañía ${companyId}:`, error);
      // Devolver un array vacío en caso de error para no romper la UI
      return []; 
    }
  }
}

export const dishService = new DishService();
