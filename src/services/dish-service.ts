
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

// El servicio del lado del cliente ahora llama a la API.

class DishService {

  async getDishesByCompany(companyId: string): Promise<Dish[]> {
    if (!companyId) return [];
    try {
      // Esta es la forma correcta de hacerlo en el cliente, a través de la API
      const response = await fetch(`/api/companies/${companyId}/dishes`);
      if (!response.ok) {
        throw new Error('Failed to fetch dishes from API');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching dishes for company ${companyId}:`, error);
      return []; // Devuelve un array vacío en caso de error para no romper la UI
    }
  }
}

export const dishService = new DishService();
