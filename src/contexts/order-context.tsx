
"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import type { Order } from '@/types'; 
import { useOrders } from "@/hooks/use-orders";

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => Promise<string>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  loading: boolean;
  error: Error | null;
  refreshOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrderContext = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrderContext debe usarse dentro de OrderProvider");
  return ctx;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const restaurantId = 'websapmax'; 
  const { orders, isLoading, error, refreshOrders } = useOrders(restaurantId);

  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'date'>) => {
    if (!db) {
      throw new Error("La base de datos no está disponible.");
    }
    const orderWithTimestamp = {
      ...orderData,
      fecha: Timestamp.now(), 
      estado: orderData.status,
    };
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
    await refreshOrders(); 
    return docRef.id;
  }, [refreshOrders]);

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>) => {
     if (!db) {
      throw new Error("La base de datos no está disponible.");
    }
    const orderRef = doc(db, 'orders', id);
    const updatePayload: any = {};
    if (updates.status) {
      updatePayload.estado = updates.status; 
    }
    
    await updateDoc(orderRef, updatePayload);
    await refreshOrders();
  }, [refreshOrders]);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, loading: isLoading, error, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
