
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
  const { data, error, isLoading } = useSWR<LandingConfig | null>(SWR_KEY, fetcher, {
      revalidateOnFocus: false, // Public content doesn't need frequent revalidation
      shouldRetryOnError: true,
  });

  const defaultConfig = landingConfigService.getDefaultConfig();

  // If there's an error fetching or no data is returned, fall back to the default config.
  const config = data && !error ? data : defaultConfig;

  return {
    config,
    isLoading,
    error,
  };
}
