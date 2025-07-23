
"use client";

import useSWR from 'swr';
import type { Order } from '@/types';

const fetcher = async (url: string): Promise<Order[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de pedidos' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de los pedidos');
  }
  const data = await response.json();
  console.log('✅ [useOrders] Datos recibidos de la API:', data);
  return data;
};

export function useOrders(companyId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    companyId ? `/api/companies/${companyId}/orders` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    orders: data || [],
    isLoading,
    isError: !!error,
    error,
    refreshOrders: mutate,
  };
}
