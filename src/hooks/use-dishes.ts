
"use client";

import useSWR from 'swr';
import type { Dish } from '@/types';
import { useSession } from '@/contexts/session-context';

const fetcher = async (url: string): Promise<Dish[]> => {
  console.log(`🔵 [useDishes] Fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de platos' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de los platos');
  }
  const data = await response.json();
  console.log(`✅ [useDishes] Datos recibidos para ${url}:`, data.length, "platos.");
  return data;
};

export function useDishes(companyId: string | undefined) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  const effectiveCompanyId = companyId || currentUser.companyId;

  const shouldFetch = effectiveCompanyId && !isSessionLoading;
  
  if (effectiveCompanyId) {
      console.log(`🔵 [useDishes] Hook evaluado. CompanyId efectivo: ${effectiveCompanyId}. ¿Debería hacer fetch? ${shouldFetch}`);
  }

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
