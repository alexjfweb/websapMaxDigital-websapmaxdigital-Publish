
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
      revalidateOnFocus: false,
      shouldRetryOnError: false,
  });

  const defaultConfig = landingConfigService.getDefaultConfig();

  // CAMBIO: Solo usar defaultConfig si hay error real, no si data es null
  const config = error ? defaultConfig : (data || defaultConfig);
  
  console.log('Hook debug:', { 
    hasError: !!error, 
    hasData: !!data, 
    isLoading, 
    configSource: error ? 'default' : (data ? 'database' : 'default')
  });
  
  return {
    config,
    isLoading,
    error,
  };
}
