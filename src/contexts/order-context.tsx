
"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import type { Order } from '@/types'; 
import { useSession } from "./session-context";

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

const fetcher = async (url: string): Promise<Order[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener los pedidos.');
  }
  return response.json();
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useSession();
  const companyId = currentUser.companyId;

  // Solo intentar hacer fetch si hay un companyId
  const shouldFetch = !!companyId;

  const { data: orders = [], error, isLoading, mutate } = useSWR<Order[], Error>(
    shouldFetch ? `/api/companies/${companyId}/orders` : null,
    fetcher,
    {
      revalidateOnFocus: false, 
      shouldRetryOnError: false,
    }
  );

  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'date'>) => {
    if (!db) {
      throw new Error("La base de datos no está disponible.");
    }
    const orderWithTimestamp = {
      ...orderData,
      date: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
    mutate(); 
    return docRef.id;
  }, [mutate]);

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>) => {
     if (!db) {
      throw new Error("La base de datos no está disponible.");
    }
    const orderRef = doc(db, 'orders', id);
    const updatePayload: any = { ...updates };
    
    await updateDoc(orderRef, { ...updatePayload, updatedAt: serverTimestamp() });
    mutate();
  }, [mutate]);

  // Si no hay companyId, no hay nada que renderizar o procesar aún
  if (!shouldFetch && currentUser.role !== 'guest') {
    return <>{children}</>;
  }

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, loading: isLoading, error, refreshOrders: mutate }}>
      {children}
    </OrderContext.Provider>
  );
};
