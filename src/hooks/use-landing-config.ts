
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';

const SWR_KEY = 'public-landing-config';

// The fetcher function for SWR, which directly calls the service method.
const fetcher = (): Promise<LandingConfig> => landingConfigService.getLandingConfig();

/**
 * Hook for public pages to fetch and display the landing page configuration.
 * It uses SWR for robust data fetching, caching, and state management.
 */
export function usePublicLandingConfig() {
  const { data, error, isLoading, mutate } = useSWR<LandingConfig, Error>(
    SWR_KEY,
    fetcher,
    {
      revalidateOnFocus: false, // Optional: Adjust as needed
      shouldRetryOnError: true, // Let SWR handle retries on network issues
      errorRetryCount: 2,
    }
  );

  const defaultConfig = landingConfigService.getDefaultConfig();

  return {
    // If data is available, use it; otherwise, fall back to the default config.
    config: data || defaultConfig,
    // isLoading is true only during the initial fetch.
    isLoading: isLoading && !data && !error,
    // Provide a clear error message if fetching fails.
    error: error ? error.message : null,
    // Expose the 'mutate' function to allow manual re-fetching.
    refetch: mutate,
  };
}
