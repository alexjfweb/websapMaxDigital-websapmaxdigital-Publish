
"use client";

import useSWR from 'swr';
import type { Order } from '@/types';

// El fetcher ahora puede lanzar un error si la API falla, SWR lo capturará.
const fetcher = async (url: string): Promise<Order[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de pedidos' }));
    // Lanzar un error para que SWR lo maneje en su propiedad `error`.
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de los pedidos');
  }
  const data = await response.json();
  console.log('✅ [useOrders] Datos recibidos de la API:', data);
  return data;
};

export function useOrders(companyId: string | null) {
  const { data, error, isLoading, mutate, isValidating } = useSWR<Order[], Error>(
    companyId ? `/api/companies/${companyId}/orders` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Puedes ajustar esto según tus necesidades
      shouldRetryOnError: false, // Evita reintentos continuos si la API falla
    }
  );

  return {
    orders: data || [],
    //isLoading ahora es una combinación de la carga inicial y la revalidación
    isLoading: isLoading || isValidating, 
    isError: !!error,
    error,
    refreshOrders: mutate,
  };
}
