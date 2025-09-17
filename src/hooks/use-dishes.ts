
"use client";

import useSWR from 'swr';
import type { Dish } from '@/types';
import { useSession } from '@/contexts/session-context';
import { dishService } from '@/services/dish-service'; // Importar el servicio

// El fetcher ahora es una función que llama directamente al servicio.
// La clave de SWR pasará el companyId a esta función.
const fetcher = ([, companyId]: [string, string]) => dishService.getDishesByCompany(companyId);

export function useDishes(companyId?: string) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  // Asegura que usemos el companyId del currentUser si está disponible, como fallback
  const effectiveCompanyId = companyId || currentUser?.companyId;

  // La petición solo se debe hacer si tenemos un ID de compañía válido
  const shouldFetch = !!effectiveCompanyId;
  
  // La clave de SWR ahora es un array. Esto es una buena práctica y ayuda a SWR a cachear correctamente.
  const swrKey = shouldFetch ? [`dishes`, effectiveCompanyId] : null;

  const { data, error, isLoading, mutate } = useSWR<Dish[]>(
    swrKey,
    fetcher, // Usamos nuestro nuevo fetcher
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false // Es mejor manejar los reintentos manualmente si es necesario
    }
  );

  return {
    dishes: data || [],
    isLoading: isSessionLoading || (shouldFetch && isLoading),
    error: error ? (error.message || 'Error al cargar platos') : null,
    refreshDishes: mutate,
  };
}
