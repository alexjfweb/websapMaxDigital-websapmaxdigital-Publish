
"use client";

import { useState, useEffect } from 'react';
import type { LandingConfig } from '@/services/landing-config-service';
import { landingConfigService } from '@/services/landing-config-service';
import useSWR from 'swr';

// Key for SWR to cache the landing config
const SWR_KEY = 'public-landing-config';

// The fetcher function for SWR
const fetcher = (): Promise<LandingConfig> => landingConfigService.getLandingConfig();

export function useDefaultConfig(): LandingConfig {
    return landingConfigService.getDefaultConfig();
}

/**
 * Hook for public pages to fetch and display the landing page configuration.
 * It fetches data from Firestore and provides loading and error states.
 */
export function usePublicLandingConfig() {
  const { data, error, isLoading, isValidating } = useSWR<LandingConfig>(SWR_KEY, fetcher, {
      revalidateOnFocus: false, // Prevents re-fetching on window focus, can be noisy
      shouldRetryOnError: false,
  });

  const defaultConfig = landingConfigService.getDefaultConfig();

  // CORRECCIÓN DEFINITIVA: 
  // 1. Mantenemos el `data` existente si `isValidating` (revalidando en segundo plano).
  // 2. Solo usamos `defaultConfig` si hay un `error` o si la carga inicial está ocurriendo y aún no hay `data`.
  const config = data || defaultConfig;
  const finalIsLoading = isLoading && !data; // Solo está "cargando" la primera vez.

  console.log('Hook debug:', { 
    hasError: !!error, 
    hasData: !!data, 
    isLoading: finalIsLoading,
    isRevalidating: isValidating,
    configSource: data ? 'database' : 'default'
  });
  
  return {
    config,
    isLoading: finalIsLoading,
    error,
  };
}
