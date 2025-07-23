
"use client";

import useSWR from 'swr';
import type { Reservation } from '@/types';

const fetcher = async (url: string): Promise<Reservation[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de reservas' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de las reservas');
  }
  return response.json();
};

export function useReservations(companyId: string) {
  const { data, error, isLoading, mutate } = useSWR<Reservation[]>(
    companyId ? `/api/reservations?companyId=${companyId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    reservations: data || [],
    isLoading,
    error,
    refreshReservations: mutate,
  };
}
