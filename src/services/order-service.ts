
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import type { Order } from '@/types';

// Este servicio ahora llama a la API del cliente.
class OrderService {
  
  async getOrdersByCompany(companyId: string): Promise<Order[]> {
    if (!companyId) {
      console.log('[OrderService] No companyId provided, returning empty array.');
      return [];
    }
    try {
      const response = await fetch(`/api/companies/${companyId}/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching orders for company ${companyId}:`, error);
      return [];
    }
  }
}

export const orderService = new OrderService();
