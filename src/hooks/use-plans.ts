

"use client";

import useSWR from 'swr';
import { useEffect, useMemo } from 'react';
import type { LandingPlan } from '@/services/landing-plans-service';

// Función fetcher mejorada para SWR
const fetcher = async (url: string): Promise<LandingPlan[]> => {
  console.log(`[Fetcher] Obteniendo datos de: ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    let errorInfo = 'Error en la solicitud a la API';
    try {
      const errorData = await response.json();
      console.error('[Fetcher] Error en la respuesta de la API:', errorData);
      errorInfo = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch (e) {
      console.error('[Fetcher] No se pudo parsear el error JSON:', response.statusText);
      errorInfo = response.statusText;
    }
    // **CORRECCIÓN:** Se lanza el error con el mensaje de la API para que SWR lo capture.
    throw new Error(errorInfo);
  }
  const data = await response.json();
  console.log('[Fetcher] Datos recibidos y parseados:', data);
  // **CORRECCIÓN:** La API ahora devuelve el array directamente, así que no se necesita `.data`.
  return data || [];
};

// Hook principal para obtener planes de la landing
export function usePublicLandingPlans() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<LandingPlan[], Error>(
    '/api/landing-plans',
    fetcher,
    {
      revalidateOnFocus: false, 
      shouldRetryOnError: false, 
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
      console.log(`✅ [usePublicLandingPlans] Datos de planes recibidos: ${data.length} planes.`);
    }
    if (error) {
      console.error(`❌ [usePublicLandingPlans] Error al obtener datos: ${error}`);
    }
  }, [data, error, isLoading, isValidating]);

  return {
    plans: data || [], 
    isLoading: isLoading,
    isError: !!error,
    error: error,
    refreshPlans: mutate, 
  };
}
