
"use client";

import { useState, useEffect } from 'react';
import type { LandingConfig } from '@/services/landing-config-service';
import { landingConfigService } from '@/services/landing-config-service';
import useSWR from 'swr';

// Key for SWR to cache the landing config
const SWR_KEY = 'public-landing-config';

// The fetcher function for SWR
const fetcher = (): Promise<LandingConfig | null> => landingConfigService.getLandingConfig();

export function useDefaultConfig(): LandingConfig {
    return landingConfigService.getDefaultConfig();
}

/**
 * Hook for public pages to fetch and display the landing page configuration.
 * It fetches data from Firestore and provides loading and error states.
 */
export function usePublicLandingConfig() {
  const { data, error, isLoading, isValidating } = useSWR<LandingConfig | null>(SWR_KEY, fetcher, {
      revalidateOnFocus: false, // Public content doesn't need frequent revalidation
      shouldRetryOnError: false, // Desactivar reintentos automáticos para manejar el fallback
  });

  const defaultConfig = landingConfigService.getDefaultConfig();

  // Determinar el estado de carga final. Estará cargando si SWR está en su ciclo inicial.
  const finalIsLoading = isLoading;

  // Si hay un error, o si terminó de cargar y no hay datos, usar la config por defecto.
  // De lo contrario, usar los datos obtenidos.
  const config = error || (!isLoading && !data) ? defaultConfig : (data || defaultConfig);
  
  return {
    config,
    isLoading: finalIsLoading,
    error,
  };
}
