
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
  const { data, error, isLoading, mutate } = useSWR<LandingConfig, Error>(SWR_KEY, fetcher, {
      revalidateOnFocus: false, // Prevents re-fetching on window focus, can be distracting during dev
      shouldRetryOnError: false, // Important to see the actual error
  });

  const defaultConfig = landingConfigService.getDefaultConfig();

  return {
    config: data || defaultConfig,
    isLoading: isLoading && !data && !error,
    error: error ? error.message : null,
    refetch: mutate,
  };
}
