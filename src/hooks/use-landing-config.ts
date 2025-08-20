"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';

const SWR_KEY = 'landing-page-config';

const fetcher = () => landingConfigService.getLandingConfig();

export function useLandingConfig() {
  const { data, error, isLoading } = useSWR<LandingConfig, Error>(
    SWR_KEY,
    fetcher,
    {
      revalidateOnFocus: false, 
      shouldRetryOnError: false, 
    }
  );

  return {
    landingConfig: data || landingConfigService.getDefaultConfig(),
    isLoading,
    isError: !!error,
    error: error || null,
  };
}
