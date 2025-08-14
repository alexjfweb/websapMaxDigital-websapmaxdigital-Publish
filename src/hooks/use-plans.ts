

"use client";

import useSWR from 'swr';
import { useEffect, useMemo } from 'react';
import { landingPlansService, type LandingPlan } from '@/services/landing-plans-service';

// **SOLUCIÓN:** El fetcher ahora llama directamente al servicio en lugar de a una API.
// Esto evita la capa de red del backend de Next.js que estaba fallando.
const fetcher = async (): Promise<LandingPlan[]> => {
  console.log(`[Fetcher] Obteniendo planes directamente desde landingPlansService...`);
  try {
    // Aquí se llama al servicio que consulta Firestore directamente.
    const plans = await landingPlansService.getPlans();
    console.log(`[Fetcher] Datos recibidos del servicio: ${plans.length} planes.`);
    return plans;
  } catch (error: any) {
    console.error('[Fetcher] Error al obtener los planes desde el servicio:', error);
    // Relanzar el error para que SWR lo capture y lo muestre.
    // Usamos el mensaje del error original para dar más contexto.
    throw new Error(error.message || 'Error al obtener los planes directamente desde el servicio.');
  }
};

// Hook principal para obtener planes de la landing
export function usePublicLandingPlans() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<LandingPlan[], Error>(
    'landing-plans-direct', // Clave única y descriptiva para SWR
    fetcher,
    {
      revalidateOnFocus: false,
      // **SOLUCIÓN:** Prevenir reintentos en caso de error para no causar bucles infinitos.
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
      console.error(`❌ [usePublicLandingPlans] Error al obtener datos: ${error.message}`);
    }
  }, [data, error, isLoading, isValidating]);
  
  // El servicio ya se encarga de filtrar y ordenar.
  const publicPlans = data || [];

  return {
    plans: publicPlans, 
    isLoading: isLoading,
    isError: !!error,
    error: error,
    refreshPlans: mutate, 
  };
}
