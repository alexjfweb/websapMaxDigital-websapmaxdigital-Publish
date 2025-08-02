
"use client";

import useSWR from 'swr';
import type { Reservation } from '@/types';
import { useSession } from '@/contexts/session-context';
import { reservationService } from '@/services/reservation-service';

// El "fetcher" ahora será la llamada directa al servicio de Firestore.
// La clave SWR ('swrKey') contendrá el ID de la compañía para asegurar que SWR
// vuelva a buscar los datos solo si el ID de la compañía cambia.
const fetcher = ([_, companyId]: [string, string]): Promise<Reservation[]> => {
  return reservationService.getReservationsByCompany(companyId);
};

export function useReservations(companyId?: string) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  // Determina el ID de compañía a usar, priorizando el que se pasa como argumento.
  const effectiveCompanyId = companyId || currentUser.companyId;

  // La clave para SWR. Si no hay ID de compañía, la clave es null y SWR no se ejecutará.
  const swrKey = effectiveCompanyId ? ['reservations', effectiveCompanyId] : null;

  const { data, error, isLoading, mutate } = useSWR<Reservation[], Error>(
    swrKey,
    fetcher, // SWR llamará a esta función con `swrKey` como argumento.
    {
      revalidateOnFocus: true, // Recarga los datos cuando el usuario vuelve a la pestaña.
      shouldRetryOnError: false // Evita reintentos automáticos en caso de error.
    }
  );

  return {
    reservations: data || [],
    isLoading: isSessionLoading || isLoading,
    error,
    refreshReservations: mutate,
  };
}
