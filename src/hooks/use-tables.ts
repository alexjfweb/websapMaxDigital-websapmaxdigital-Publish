
"use client";

import useSWR from 'swr';
import type { Table } from '@/services/table-service';

const fetcher = async (url: string): Promise<Table[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API de mesas' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de las mesas');
  }
  return response.json();
};

export function useTables(companyId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Table[]>(
    companyId ? `/api/companies/${companyId}/tables` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    tables: data || [],
    isLoading,
    isError: !!error,
    error,
    refreshTables: mutate,
  };
}
