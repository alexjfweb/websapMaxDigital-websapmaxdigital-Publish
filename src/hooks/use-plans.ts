

"use client";

import useSWR from 'swr';
import { useEffect, useMemo } from 'react';
import { landingPlansService, type LandingPlan } from '@/services/landing-plans-service';

// Función fetcher que ahora llama directamente al servicio en lugar de a una API
const fetcher = async (): Promise<LandingPlan[]> => {
  console.log(`[Fetcher] Obteniendo datos directamente desde landingPlansService...`);
  try {
    const plans = await landingPlansService.getPlans();
    console.log(`[Fetcher] Datos recibidos y parseados: ${plans.length} planes.`);
    return plans;
  } catch (error) {
    console.error('[Fetcher] Error al obtener los planes desde el servicio:', error);
    // Relanzar el error para que SWR lo capture
    throw new Error('Error al obtener los planes. Es posible que se requiera un índice en Firestore.');
  }
};

// Hook principal para obtener planes de la landing
export function usePublicLandingPlans() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<LandingPlan[], Error>(
    'landing-plans', // Clave única para SWR
    fetcher,
    {
      revalidateOnFocus: false, 
      shouldRetryOnError: false, // Previene bucles infinitos en caso de error
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
      console.error(`❌ [usePublicLandingPlans] Error al obtener datos: ${error.message}`);
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
