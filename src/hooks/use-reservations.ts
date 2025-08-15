"use client";

import useSWR from 'swr';
import type { Reservation } from '@/types';
import { useSession } from '@/contexts/session-context';

// Fetcher estándar para obtener datos de una URL.
const fetcher = async (url: string): Promise<Reservation[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener las reservaciones.');
  }
  return response.json();
};

export function useReservations(companyId?: string) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  // Determina el ID de compañía a usar.
  const effectiveCompanyId = companyId || currentUser?.companyId;

  // La URL de la API que SWR usará como clave. Si no hay ID, la clave es null.
  const apiUrl = effectiveCompanyId ? `/api/companies/${effectiveCompanyId}/reservations` : null;

  const { data, error, isLoading, mutate } = useSWR<Reservation[], Error>(
    apiUrl, // La clave ahora es la URL de la API.
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false
    }
  );

  return {
    reservations: data || [],
    // El estado de carga incluye tanto la sesión como la obtención de datos.
    isLoading: isSessionLoading || (!!apiUrl && isLoading),
    error,
    refreshReservations: mutate,
  };
}
