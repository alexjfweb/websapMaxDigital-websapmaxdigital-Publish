
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
    if (typeof timestamp === 'object' && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toISOString();
    }
    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    return new Date().toISOString();
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
        
        // Validación más robusta de los datos del pedido
        if (
          !data.cliente?.nombre ||
          !data.fecha ||
          !data.total ||
          typeof data.total !== 'number' ||
          !data.estado
        ) {
          console.warn(`[WARN] Documento de pedido ${doc.id} omitido por datos incompletos o inválidos (cliente, fecha, total o estado).`);
          return;
        }

        const date = this.parseTimestamp(data.fecha);

        // Los productos son opcionales, si no existen se usa un array vacío
        const productos = Array.isArray(data.productos) ? data.productos : [];

        orders.push({
          id: doc.id,
          customerName: data.cliente.nombre,
          date: date,
          items: productos.reduce((sum: number, item: any) => sum + (item.cantidad || 0), 0),
          total: data.total,
          status: data.estado,
          type: data.mesa ? 'dine-in' : 'delivery',
          restaurantId: data.restaurantId,
          productos: productos,
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
