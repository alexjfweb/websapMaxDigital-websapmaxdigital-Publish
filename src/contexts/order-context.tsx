
"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import type { Order } from '@/types'; // Importar Order desde types
import { useOrders } from "@/hooks/use-orders"; // Importar el nuevo hook

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => Promise<string>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  loading: boolean;
  error: any;
  refreshOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrderContext = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrderContext debe usarse dentro de OrderProvider");
  return ctx;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  // Por ahora, asumimos un ID de restaurante fijo. En una app real, esto sería dinámico.
  const restaurantId = 'websapmax'; 
  const { orders, isLoading, error, refreshOrders } = useOrders(restaurantId);

  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'date'>) => {
    const orderWithTimestamp = {
      ...orderData,
      fecha: Timestamp.now(), // Firestore espera 'fecha', no 'date'
      estado: orderData.status, // Firestore espera 'estado', no 'status'
    };
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
    refreshOrders(); // Refrescar la lista de pedidos después de añadir uno nuevo
    return docRef.id;
  }, [refreshOrders]);

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>) => {
    const orderRef = doc(db, 'orders', id);
    const updatePayload: any = {};
    if (updates.status) {
      updatePayload.estado = updates.status; // Mapear 'status' a 'estado'
    }
    // Añadir otros posibles campos a actualizar aquí
    
    await updateDoc(orderRef, updatePayload);
    refreshOrders(); // Refrescar la lista de pedidos después de actualizar
  }, [refreshOrders]);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, loading: isLoading, error, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
