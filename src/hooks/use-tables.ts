
"use client";

import useSWR from 'swr';
import type { Table } from '@/services/table-service';
import { useSession } from '@/contexts/session-context'; // Importar hook de sesión

const fetcher = async (url: string): Promise<Table[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de mesas' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de las mesas');
  }
  return response.json();
};

export function useTables(companyId: string | null) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  // La petición solo se hará si el usuario está autenticado y no es un invitado
  const shouldFetch = companyId && !isSessionLoading && currentUser.role !== 'guest';

  const { data, error, isLoading, mutate } = useSWR<Table[]>(
    shouldFetch ? `/api/companies/${companyId}/tables` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    tables: data || [],
    isLoading: isSessionLoading || isLoading,
    isError: !!error,
    error,
    refreshTables: mutate,
  };
}
