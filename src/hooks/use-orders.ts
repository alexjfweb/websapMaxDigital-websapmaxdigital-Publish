
"use client";

import useSWR from 'swr';
import type { Order } from '@/types';
import { useSession } from '@/contexts/session-context';

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
  const { currentUser, isLoading: isSessionLoading } = useSession();

  // Solo intentar hacer fetch si tenemos un ID de compañía y la sesión no está cargando.
  // El rol 'guest' indica que no hay un usuario autenticado.
  const shouldFetch = companyId && !isSessionLoading && currentUser.role !== 'guest';

  const { data, error, isLoading, mutate, isValidating } = useSWR<Order[], Error>(
    shouldFetch ? `/api/companies/${companyId}/orders` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: (err) => {
        console.error("❌ [useOrders] Error capturado por SWR:", err);
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
