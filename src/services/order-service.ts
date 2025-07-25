
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
  private get ordersCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'orders'.");
      return null;
    }
    return collection(db, 'orders');
  }

  private parseTimestamp(timestamp: any): Date {
    if (!timestamp) return new Date();
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    if (typeof timestamp === 'string') return new Date(timestamp);
    if (timestamp instanceof Date) return timestamp;
    return new Date();
  }

  async getOrdersByCompany(companyId: string): Promise<Order[]> {
    if (!companyId) {
      console.error('[OrderService] El ID de la compañía es requerido.');
      throw new Error('El ID de la compañía es requerido.');
    }
    
    const coll = this.ordersCollection;
    if (!coll) {
        throw new Error("La conexión a la base de datos no está disponible.");
    }
    
    try {
      console.log(`[OrderService] Buscando pedidos para la compañía: ${companyId}`);
      const q = query(
        coll,
        where('restaurantId', '==', companyId),
        orderBy('date', 'desc') 
      );

      const querySnapshot = await getDocs(q);
      console.log(`[OrderService] Se encontraron ${querySnapshot.size} documentos para la compañía ${companyId}.`);
      
      const orders: Order[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        if (!data.cliente?.nombre || !data.date || typeof data.total !== 'number' || !data.status) {
          console.warn(`[WARN] Documento de pedido ${doc.id} omitido por datos incompletos.`);
          return;
        }

        const date = this.parseTimestamp(data.date);
        const productos = Array.isArray(data.productos) ? data.productos : [];

        orders.push({
          id: doc.id,
          customerName: data.cliente.nombre,
          date: date.toISOString(),
          items: productos.reduce((sum: number, item: any) => sum + (item.cantidad || 0), 0),
          total: data.total,
          status: data.status,
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
