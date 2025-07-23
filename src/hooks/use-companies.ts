"use client";

import useSWR from 'swr';
import type { Company } from '@/types';

const fetcher = async (url: string): Promise<Company[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud a la API' }));
    throw new Error(errorData.error || errorData.message || 'Error al obtener los datos de las empresas');
  }
  const data = await response.json();
  // La API ahora devuelve un objeto { data: [...] }, así que accedemos a la propiedad `data`
  return data.data || [];
};

export function useCompanies() {
  const { data, error, isLoading, mutate } = useSWR<Company[]>('/api/companies', fetcher);

  return {
    companies: data || [],
    isLoading,
    error,
    refreshCompanies: mutate,
  };
}
