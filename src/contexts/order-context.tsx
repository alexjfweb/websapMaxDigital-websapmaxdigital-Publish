
"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, Timestamp, where } from 'firebase/firestore';

// Definición del tipo Order
export interface Order {
  id: string;
  customerName: string;
  date: string;
  items: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled';
  type: 'delivery' | 'pickup' | 'dine-in';
  restaurantId: string;
  productos: { id: string, nombre: string, cantidad: number, precio: number }[];
  cliente: {
    nombre: string;
    telefono: string;
    direccion: string;
    correo?: string;
    notas?: string;
  };
  mesa?: {
    tableId: string;
    tableNumber: number;
  };
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => Promise<string>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrderContext = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrderContext debe usarse dentro de OrderProvider");
  return ctx;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escucha en tiempo real para todos los pedidos
    const q = query(collection(db, 'orders'), orderBy('fecha', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: (data.fecha as Timestamp).toDate().toISOString(),
          customerName: data.cliente.nombre,
          items: data.productos.reduce((sum: number, p: any) => sum + p.cantidad, 0),
          total: data.total,
          status: data.estado,
          type: data.mesa ? 'dine-in' : 'delivery', // Lógica simple para determinar tipo
          ...data
        } as Order;
      });
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener pedidos en tiempo real:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addOrder = async (order: Omit<Order, 'id' | 'date'>) => {
    const orderWithTimestamp = {
      ...order,
      fecha: Timestamp.now(), // Usar 'fecha' como en la lectura
    };
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
    return docRef.id;
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    const orderRef = doc(db, 'orders', id);
    // Renombrar 'status' a 'estado' para coincidir con la BD
    const updatePayload: any = {};
    if (updates.status) {
      updatePayload.estado = updates.status;
    }
    await updateDoc(orderRef, updatePayload);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, loading }}>
      {children}
    </OrderContext.Provider>
  );
};
