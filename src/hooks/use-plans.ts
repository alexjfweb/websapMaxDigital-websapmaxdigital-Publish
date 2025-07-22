"use client";

import useSWR from 'swr';
import type { LandingPlan } from '@/services/landing-plans-service';

// Tipos para las respuestas de la API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

// Función fetcher para SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la solicitud');
  }
  const result: LandingPlan[] = await response.json();
  return result;
};


// Hook principal para obtener planes de la landing
export function usePublicLandingPlans() {
  const { data, error, isLoading } = useSWR<LandingPlan[]>(
    '/api/landing-plans',
    fetcher,
    {
      revalidateOnFocus: false, // Opcional: ajustar según necesidad
    }
  );

  return {
    plans: data || [],
    isLoading,
    isError: !!error,
    error: error?.message,
  };
}
