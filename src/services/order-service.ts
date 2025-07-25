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
      throw new Error("La conexión a la base de datos no está disponible.");
    }
    return collection(db, 'orders');
  }

  private parseTimestamp(timestamp: any): Date {
    // Si es un Timestamp de Firestore, es la forma preferida
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    // Si ya es un objeto Date
    if (timestamp instanceof Date) {
      return timestamp;
    }
    // Si es un objeto con seconds y nanoseconds (formato común de Firestore sin ser instancia)
    if (timestamp && typeof timestamp.seconds === 'number') {
        return new Date(timestamp.seconds * 1000);
    }
    // Si es un string de fecha ISO
    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    // Fallback: si nada funciona, loguea una advertencia y devuelve la fecha actual
    console.warn(`[WARN] Formato de fecha no reconocido, se usará la fecha actual:`, timestamp);
    return new Date();
  }


  async getOrdersByCompany(companyId: string): Promise<Order[]> {
    if (!companyId) {
      console.error('[OrderService] El ID de la compañía es requerido.');
      throw new Error('El ID de la compañía es requerido.');
    }
    
    try {
      const coll = this.ordersCollection; 
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
        
        if (
          !data.cliente?.nombre ||
          !data.date ||
          data.total === undefined ||
          typeof data.total !== 'number' ||
          !data.status
        ) {
          console.warn(`[WARN] Documento de pedido ${doc.id} omitido por datos incompletos o inválidos (cliente, fecha, total o estado).`);
          return;
        }

        const date = this.parseTimestamp(data.date);
        const productos = Array.isArray(data.productos) ? data.productos : [];

        orders.push({
          id: doc.id,
          customerName: data.cliente.nombre,
          date: date.toISOString(), // Mantenemos string para la API, el hook se encargará de convertir
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
