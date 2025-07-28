
"use client";

import useSWR from 'swr';
import type { Dish } from '@/types';
import { useSession } from '@/contexts/session-context'; // Importar hook de sesión

const fetcher = async (url: string): Promise<Dish[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de platos' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de los platos');
  }
  return response.json();
};

export function useDishes(companyId: string) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  // La petición solo se hará si el usuario está autenticado y no es un invitado
  const shouldFetch = companyId && !isSessionLoading && currentUser.role !== 'guest';

  const { data, error, isLoading, mutate } = useSWR<Dish[]>(
    shouldFetch ? `/api/companies/${companyId}/dishes` : null,
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
