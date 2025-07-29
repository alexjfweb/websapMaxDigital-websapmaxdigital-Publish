
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
  return response.json();
};

export function useDishes(companyId: string | undefined) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  const effectiveCompanyId = companyId || currentUser.companyId;

  const shouldFetch = effectiveCompanyId && !isSessionLoading;

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
