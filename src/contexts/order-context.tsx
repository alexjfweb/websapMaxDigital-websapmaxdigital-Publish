"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import type { Order } from '@/types'; 
import { useSession } from "./session-context";
import { serializeDate } from "@/lib/utils";

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

// Fetcher ahora consulta directamente a Firestore
const fetcher = async ([_, companyId]: [string, string]): Promise<Order[]> => {
  if (!companyId) return [];

  const ordersQuery = query(
    collection(db, "orders"),
    where("restaurantId", "==", companyId)
  );

  const snapshot = await getDocs(ordersQuery);
  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: serializeDate(data.date)!,
      updatedAt: serializeDate(data.updatedAt)!,
    } as Order;
  });
};


export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const companyId = currentUser?.companyId;

  // Solo intentar hacer fetch si la sesión ha cargado Y hay un companyId
  const shouldFetch = !isSessionLoading && !!companyId;

  const { data: orders = [], error, isLoading, mutate } = useSWR<Order[], Error>(
    shouldFetch ? [`orders`, companyId] : null, // Clave de SWR actualizada
    fetcher,
    {
      revalidateOnFocus: true,
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
    if(shouldFetch) mutate(); 
    return docRef.id;
  }, [mutate, shouldFetch]);

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>) => {
     if (!db) {
      throw new Error("La base de datos no está disponible.");
    }
    const orderRef = doc(db, 'orders', id);
    const updatePayload: any = { ...updates };
    
    await updateDoc(orderRef, { ...updatePayload, updatedAt: serverTimestamp() });
    if(shouldFetch) mutate();
  }, [mutate, shouldFetch]);
  
  const finalLoadingState = isSessionLoading || (shouldFetch && isLoading);


  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, loading: finalLoadingState, error, refreshOrders: () => {if(shouldFetch) mutate();} }}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;
