
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';

const SWR_KEY = 'landing-page-config';

// El fetcher ahora es una función simple que llama al método del servicio.
const fetcher = () => landingConfigService.getLandingConfig();

/**
 * Hook para obtener la configuración de la página de inicio.
 * Utiliza SWR para cache, revalidación y manejo de estados de carga/error.
 */
export function useLandingConfig() {
  const { data, error, isLoading } = useSWR<LandingConfig, Error>(
    SWR_KEY,
    fetcher,
    {
      revalidateOnFocus: false, // Evita recargas innecesarias
      shouldRetryOnError: false, // No reintentar si falla la carga inicial
    }
  );

  return {
    landingConfig: data || landingConfigService.getDefaultConfig(), // Devuelve config por defecto si data es undefined
    isLoading,
    isError: !!error,
  };
}
