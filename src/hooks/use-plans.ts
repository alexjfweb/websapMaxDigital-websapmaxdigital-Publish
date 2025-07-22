
"use client";

import useSWR from 'swr';
import { useEffect } from 'react';
import type { LandingPlan } from '@/services/landing-plans-service';

// Función fetcher mejorada para SWR
const fetcher = async (url: string): Promise<LandingPlan[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    let errorInfo = 'Error en la solicitud a la API';
    try {
      // Intenta obtener un mensaje de error más específico del cuerpo de la respuesta
      const errorData = await response.json();
      errorInfo = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch (e) {
      // Si el cuerpo no es JSON o está vacío, usa el texto de estado
      errorInfo = response.statusText;
    }
    throw new Error(errorInfo);
  }
  // La API devuelve el array de planes directamente
  return response.json();
};

// Hook principal para obtener planes de la landing
export function usePublicLandingPlans() {
  const { data, error, isLoading } = useSWR<LandingPlan[], Error>(
    '/api/landing-plans',
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false, // Evita reintentos para tener un control más claro del error
    }
  );

  // Logs para depuración en la consola del navegador
  useEffect(() => {
    if (isLoading) {
      console.log('⏳ [usePublicLandingPlans] Cargando planes...');
    }
    if (data) {
      console.log('✅ [usePublicLandingPlans] Datos recibidos:', data);
    }
    if (error) {
      console.error('❌ [usePublicLandingPlans] Error al obtener datos:', error);
    }
  }, [data, error, isLoading]);

  return {
    plans: data || [],
    isLoading,
    isError: !!error,
    error: error,
  };
}
