
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

class OrderService {
  private ordersCollection = collection(db, 'orders');

  private parseTimestamp(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (timestamp instanceof Timestamp) return timestamp.toDate().toISOString();
    // Handle cases where timestamp might be a plain object from Firestore serialization
    if (typeof timestamp === 'object' && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toISOString();
    }
    if (typeof timestamp === 'string') {
        // Attempt to parse if it's a string, otherwise return as is if valid, or fallback
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    return new Date().toISOString(); // Fallback for any other unexpected format
  }

  async getOrdersByCompany(companyId: string): Promise<Order[]> {
    if (!companyId) {
      throw new Error('El ID de la compañía es requerido.');
    }
    
    try {
      const q = query(
        this.ordersCollection,
        where('restaurantId', '==', companyId),
        orderBy('fecha', 'desc') 
      );

      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        if (
          !data.cliente?.nombre ||
          !data.fecha ||
          !Array.isArray(data.productos) ||
          data.productos.length === 0 ||
          typeof data.total !== 'number' ||
          data.total <= 0 ||
          !data.estado
        ) {
          console.warn(`[WARN] Documento de pedido ${doc.id} omitido por datos incompletos o inválidos.`);
          return;
        }

        const date = this.parseTimestamp(data.fecha);

        orders.push({
          id: doc.id,
          customerName: data.cliente.nombre,
          date: date,
          items: data.productos.reduce((sum: number, item: any) => sum + item.cantidad, 0),
          total: data.total,
          status: data.estado,
          type: data.mesa ? 'dine-in' : 'delivery',
          restaurantId: data.restaurantId,
          productos: data.productos,
          cliente: data.cliente,
          mesa: data.mesa,
        });
      });
      
      console.log(`✅ Se obtuvieron ${orders.length} pedidos válidos para la compañía ${companyId}.`);
      return orders;
    } catch (error) {
      console.error(`❌ Error al obtener los pedidos para la compañía ${companyId}:`, error);
      throw new Error('No se pudieron obtener los pedidos.');
    }
  }
}

export const orderService = new OrderService();
