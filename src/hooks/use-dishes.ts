
"use client";

import useSWR from 'swr';
import type { Dish } from '@/types';

const fetcher = async (url: string): Promise<Dish[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de platos' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de los platos');
  }
  return response.json();
};

export function useDishes(companyId: string) {
  const { data, error, isLoading, mutate } = useSWR<Dish[]>(
    companyId ? `/api/companies/${companyId}/dishes` : null,
    fetcher,
    {
      revalidateOnFocus: true, // Revalidar para mantener los datos frescos
    }
  );

  return {
    dishes: data || [],
    isLoading,
    error,
    refreshDishes: mutate,
  };
}
