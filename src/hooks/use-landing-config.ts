
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
      revalidateOnFocus: true, // Re-fetch on focus to get latest changes
      shouldRetryOnError: true,
  });

  const defaultConfig = landingConfigService.getDefaultConfig();

  // CORRECCIÓN: Lógica mejorada para evitar "parpadeo"
  // 1. Si hay datos (`data`), siempre los usamos.
  // 2. Si no hay datos Y estamos cargando por primera vez, `isLoading` será true.
  // 3. Si hay un error, usamos la configuración por defecto como fallback.
  const finalConfig = data || defaultConfig;
  const initialLoading = isLoading && !data && !error;

  return {
    config: finalConfig,
    isLoading: initialLoading,
    error,
  };
}
