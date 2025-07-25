
"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import type { Order } from '@/types'; 
// Eliminamos la importación de useOrders para desacoplar el hook defectuoso.

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

// Fetcher seguro para SWR
const fetcher = async (url: string): Promise<Order[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener los pedidos.');
  }
  return response.json();
};


export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const restaurantId = 'websapmax'; // Hardcoded, podría venir de un contexto de sesión.
  const { data: orders = [], error, isLoading, mutate } = useSWR<Order[], Error>(
    restaurantId ? `/api/companies/${restaurantId}/orders` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Evita re-fetch innecesarios
      shouldRetryOnError: false,
    }
  );

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
    mutate(); // Refrescar los datos de SWR
    return docRef.id;
  }, [mutate]);

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>) => {
     if (!db) {
      throw new Error("La base de datos no está disponible.");
    }
    const orderRef = doc(db, 'orders', id);
    const updatePayload: any = {};
    if (updates.status) {
      updatePayload.estado = updates.status; 
    }
    
    await updateDoc(orderRef, { ...updatePayload, updatedAt: Timestamp.now() });
    mutate(); // Refrescar los datos de SWR
  }, [mutate]);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, loading: isLoading, error, refreshOrders: mutate }}>
      {children}
    </OrderContext.Provider>
  );
};
