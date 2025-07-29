
"use client";

import useSWR from 'swr';
import type { Reservation } from '@/types';
import { useSession } from '@/contexts/session-context';

const fetcher = async (url: string): Promise<Reservation[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de reservas' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de las reservas');
  }
  return response.json();
};

export function useReservations(companyId?: string) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  const effectiveCompanyId = companyId || currentUser.companyId;

  const shouldFetch = effectiveCompanyId && !isSessionLoading;

  const { data, error, isLoading, mutate } = useSWR<Reservation[]>(
    shouldFetch ? `/api/companies/${effectiveCompanyId}/reservations` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    reservations: data || [],
    isLoading: isSessionLoading || isLoading,
    error,
    refreshReservations: mutate,
  };
}
