
"use client";

import useSWR from 'swr';
import type { Order } from '@/types';
import { useSession } from '@/contexts/session-context';

const fetcher = async (url: string): Promise<Order[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    let errorInfo = 'Error en la solicitud a la API de pedidos';
    try {
        const errorData = await response.json();
        console.error("❌ [useOrders-Fetcher] Error en la respuesta de la API:", errorData);
        errorInfo = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch (e) {
        console.error("❌ [useOrders-Fetcher] No se pudo parsear el error JSON. Status:", response.status, "Texto:", response.statusText);
        errorInfo = response.statusText;
    }
    throw new Error(errorInfo);
  }
  const data = await response.json();
  console.log('✅ [useOrders] Datos recibidos de la API:', data.length);
  return data;
};

export function useOrders(companyId?: string | null) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  const effectiveCompanyId = companyId || currentUser?.companyId;

  const shouldFetch = effectiveCompanyId && !isSessionLoading;

  const { data, error, isLoading, mutate, isValidating } = useSWR<Order[], Error>(
    shouldFetch ? `/api/companies/${effectiveCompanyId}/orders` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
      onError: (err) => {
        console.error("❌ [useOrders] Error capturado por SWR en el hook:", err);
      }
    }
  );

  return {
    orders: data || [],
    isLoading: isSessionLoading || isLoading || isValidating,
    isError: !!error,
    error,
    refreshOrders: mutate,
  };
}
