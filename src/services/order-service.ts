
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

  /**
   * Obtiene todos los pedidos activos de una compañía específica, ordenados por fecha.
   * Valida que cada pedido tenga los campos esenciales.
   * @param companyId - El ID de la compañía.
   * @returns Un array de objetos Order.
   */
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
        
        // Validación de campos esenciales
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

        const date = data.fecha instanceof Timestamp ? data.fecha.toDate().toISOString() : new Date(data.fecha).toISOString();

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
