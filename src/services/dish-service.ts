
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
      const response = await fetch(`/api/companies/${companyId}/dishes`);
      if (!response.ok) {
        throw new Error('Failed to fetch dishes from API');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching dishes for company ${companyId}:`, error);
      return [];
    }
  }
}

export const dishService = new DishService();
