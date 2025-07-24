
"use client";

import useSWR from 'swr';
import { useEffect } from 'react';
import type { LandingPlan } from '@/services/landing-plans-service';

// Función fetcher mejorada para SWR
const fetcher = async (url: string): Promise<LandingPlan[]> => {
  console.log(`[Fetcher] Obteniendo datos de: ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    let errorInfo = 'Error en la solicitud a la API';
    try {
      // Intenta obtener un mensaje de error más específico del cuerpo de la respuesta
      const errorData = await response.json();
      console.error('[Fetcher] Error en la respuesta de la API:', errorData);
      errorInfo = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch (e) {
      console.error('[Fetcher] No se pudo parsear el error JSON:', response.statusText);
      // Si el cuerpo no es JSON o está vacío, usa el texto de estado
      errorInfo = response.statusText;
    }
    throw new Error(errorInfo);
  }
  // La API devuelve el array de planes directamente
  const data = await response.json();
  console.log('[Fetcher] Datos recibidos y parseados:', data);
  return data;
};

// Hook principal para obtener planes de la landing
export function usePublicLandingPlans() {
  const { data, error, isLoading, isValidating } = useSWR<LandingPlan[], Error>(
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
    if (isValidating) {
        console.log('🔄 [usePublicLandingPlans] Revalidando datos...');
    }
    if (data) {
      console.log(`✅ [usePublicLandingPlans] Datos de planes actualizados. Se encontraron ${data.length} planes.`);
    }
    if (error) {
      console.error('❌ [usePublicLandingPlans] Error al obtener datos:', error);
    }
  }, [data, error, isLoading, isValidating]);

  return {
    plans: data || [],
    isLoading: isLoading, // Devuelve el estado de carga inicial
    isError: !!error,
    error: error,
  };
}
