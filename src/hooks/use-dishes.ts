
"use client";

import useSWR from 'swr';
import type { Dish } from '@/types';
import { useSession } from '@/contexts/session-context';

const fetcher = async (url: string): Promise<Dish[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de platos' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de los platos');
  }
  const data = await response.json();
  return data;
};

export function useDishes(companyId: string | undefined) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  // Asegura que usemos el companyId del currentUser si está disponible, como fallback
  const effectiveCompanyId = companyId || currentUser?.companyId;

  // La petición solo se debe hacer si tenemos un ID de compañía válido
  const shouldFetch = typeof effectiveCompanyId === 'string' && effectiveCompanyId.length > 0;
  
  const { data, error, isLoading, mutate } = useSWR<Dish[]>(
    shouldFetch ? `/api/companies/${effectiveCompanyId}/dishes` : null,
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  return {
    dishes: data || [],
    isLoading: isSessionLoading || isLoading,
    error,
    refreshDishes: mutate,
  };
}

    
