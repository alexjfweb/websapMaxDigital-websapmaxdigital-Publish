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
      // Devolver un error claro en lugar de null para fallar rápido
      throw new Error("La conexión a la base de datos no está disponible.");
    }
    return collection(db, 'orders');
  }

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
    console.warn(`[WARN] No se pudo parsear el timestamp, se usará la fecha actual:`, timestamp);
    return new Date().toISOString();
  }

  async getOrdersByCompany(companyId: string): Promise<Order[]> {
    if (!companyId) {
      console.error('[OrderService] El ID de la compañía es requerido.');
      throw new Error('El ID de la compañía es requerido.');
    }
    
    try {
      // Llama al getter, que lanzará un error si db no está inicializado
      const coll = this.ordersCollection; 
      console.log(`[OrderService] Buscando pedidos para la compañía: ${companyId}`);
      const q = query(
        coll,
        where('restaurantId', '==', companyId),
        orderBy('fecha', 'desc') 
      );

      const querySnapshot = await getDocs(q);
      console.log(`[OrderService] Se encontraron ${querySnapshot.size} documentos para la compañía ${companyId}.`);
      
      const orders: Order[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        if (
          !data.cliente?.nombre ||
          !data.fecha ||
          data.total === undefined ||
          typeof data.total !== 'number' ||
          !data.estado
        ) {
          console.warn(`[WARN] Documento de pedido ${doc.id} omitido por datos incompletos o inválidos (cliente, fecha, total o estado).`);
          return;
        }

        const date = this.parseTimestamp(data.fecha);
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
