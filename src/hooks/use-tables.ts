
"use client";

import useSWR from 'swr';
import type { Table } from '@/services/table-service';
import { tableService } from '@/services/table-service';
import { useSession } from '@/contexts/session-context';

// El fetcher ahora es una función que llama directamente al servicio.
// La clave de SWR pasará el companyId a esta función.
const fetcher = ([, companyId]: [string, string]) => tableService.getAllTables(companyId);

export function useTables(companyId?: string | null) {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const effectiveCompanyId = companyId || currentUser?.companyId;
  const shouldFetch = !!effectiveCompanyId;

  // La clave de SWR ahora es un array que contiene el nombre del recurso y el ID de la compañía.
  // Esto asegura que SWR re-fetcheará si el companyId cambia.
  const swrKey = shouldFetch ? ['tables', effectiveCompanyId] : null;

  const { data, error, isLoading, mutate } = useSWR<Table[]>(
    swrKey,
    fetcher,
    {
      revalidateOnFocus: false, // Se puede mantener en false para evitar recargas excesivas
    }
  );

  return {
    tables: data || [],
    isLoading: isSessionLoading || (shouldFetch && isLoading),
    isError: !!error,
    error,
    refreshTables: mutate,
  };
}
