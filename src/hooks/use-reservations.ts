
"use client";

import useSWR from 'swr';
import type { Reservation } from '@/types';
import { useSession } from '@/contexts/session-context'; // Importar hook de sesión

const fetcher = async (url: string): Promise<Reservation[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de reservas' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de las reservas');
  }
  return response.json();
};

export function useReservations(companyId: string) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  // La petición solo se hará si el usuario está autenticado y no es un invitado
  const shouldFetch = companyId && !isSessionLoading && currentUser.role !== 'guest';

  const { data, error, isLoading, mutate } = useSWR<Reservation[]>(
    shouldFetch ? `/api/companies/${companyId}/reservations` : null,
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
