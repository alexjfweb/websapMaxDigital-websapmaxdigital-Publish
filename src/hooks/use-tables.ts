
"use client";

import useSWR from 'swr';
import type { Table } from '@/services/table-service';
import { useSession } from '@/contexts/session-context';

const fetcher = async (url: string): Promise<Table[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de mesas' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de las mesas');
  }
  return response.json();
};

export function useTables(companyId?: string | null) {
  const { currentUser, isLoading: isSessionLoading } = useSession();

  const effectiveCompanyId = companyId || currentUser.companyId;

  const shouldFetch = effectiveCompanyId && !isSessionLoading;

  const { data, error, isLoading, mutate } = useSWR<Table[]>(
    shouldFetch ? `/api/companies/${effectiveCompanyId}/tables` : null,
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
