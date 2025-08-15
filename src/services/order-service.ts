
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

// Función robusta para convertir cualquier formato de fecha a ISO string
const serializeDate = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return new Date(date).toISOString();
  if (date && typeof date === 'object' && date.seconds) {
    return new Date(date.seconds * 1000).toISOString();
  }
  return new Date().toISOString();
};


class OrderService {
  private get ordersCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'orders'.");
      return null;
    }
    return collection(db, 'orders');
  }

  async getOrdersByCompany(companyId: string): Promise<Order[]> {
    if (!companyId || typeof companyId !== 'string' || companyId.trim() === '') {
      console.error('[OrderService] El ID de la compañía es requerido y debe ser una cadena válida. Devolviendo array vacío.');
      return [];
    }
    
    const coll = this.ordersCollection;
    if (!coll) {
        console.error("[OrderService] La conexión a la base de datos no está disponible.");
        throw new Error("La conexión a la base de datos no está disponible.");
    }
    
    try {
      const q = query(
        coll,
        where('restaurantId', '==', companyId),
        orderBy('date', 'desc') 
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const orders: Order[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        // Validación básica de datos para evitar errores de renderizado
        if (!data.cliente?.nombre || !data.date || typeof data.total !== 'number' || !data.status) {
          console.warn(`[WARN] Documento de pedido ${doc.id} omitido por datos incompletos.`, data);
          return;
        }

        const productos = Array.isArray(data.productos) ? data.productos : [];

        orders.push({
          id: doc.id,
          customerName: data.cliente.nombre,
          date: serializeDate(data.date), // Serialización aplicada
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
      
      return orders;
    } catch (error: any) {
      console.error(`❌ Error al obtener los pedidos para la compañía ${companyId}:`, error);
      return [];
    }
  }
}

export const orderService = new OrderService();
