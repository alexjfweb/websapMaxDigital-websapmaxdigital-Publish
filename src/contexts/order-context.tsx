"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// Tipo de pedido (puedes expandir según tus necesidades)
export interface Order {
  id: string;
  customerName: string;
  date: string;
  items: number;
  total: number;
  status: string;
  type: string;
}

// Mock inicial (puedes reemplazar por fetch o persistencia luego)
const initialOrders: Order[] = [
  { id: "order-001", customerName: "Eva Green", date: "2024-07-31T12:30:00Z", items: 3, total: 45.50, status: "pending", type: "delivery" },
  { id: "order-002", customerName: "Frank Blue", date: "2024-07-31T11:30:00Z", items: 2, total: 22.00, status: "preparing", type: "pickup" },
  { id: "order-003", customerName: "Grace Red", date: "2024-07-31T10:30:00Z", items: 5, total: 78.25, status: "ready_for_pickup", type: "pickup" },
  { id: "order-004", customerName: "Henry Yellow", date: "2024-07-31T09:30:00Z", items: 1, total: 15.75, status: "out_for_delivery", type: "delivery" },
  { id: "order-005", customerName: "Ivy White", date: "2024-07-30T15:00:00Z", items: 4, total: 55.00, status: "completed", type: "delivery" },
  { id: "order-006", customerName: "Jack Black", date: "2024-07-29T18:00:00Z", items: 2, total: 30.50, status: "cancelled", type: "pickup" },
];

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrderContext = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrderContext debe usarse dentro de OrderProvider");
  return ctx;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // Usar datos mock para evitar problemas de Firebase
    console.log('📝 OrderContext: Usando datos mock (modo estático)');
    setOrders(initialOrders);
    setLoading(false);
  }, []);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, loading }}>
      {children}
    </OrderContext.Provider>
  );
}; 