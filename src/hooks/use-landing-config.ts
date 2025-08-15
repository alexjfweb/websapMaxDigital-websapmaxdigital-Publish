
"use client";

import useSWR, { useSWRConfig } from 'swr';
import { landingConfigService } from '@/services/landing-config-service';
import type { LandingConfig } from '@/types/landing';
import { useCallback, useMemo } from 'react';

const CONFIG_KEY = 'landing-config';

// Fetcher para SWR
const fetcher = () => landingConfigService.getLandingConfig();

export function useLandingConfig() {
  const { data, error, isLoading } = useSWR<LandingConfig | null>(CONFIG_KEY, fetcher, {
    revalidateOnFocus: false,
  });
  const { mutate } = useSWRConfig();

  const updateConfig = useCallback(async (newConfig: Partial<LandingConfig>) => {
    mutate(CONFIG_KEY, (currentConfig) => ({ ...currentConfig, ...newConfig }), false);

    try {
      await landingConfigService.updateLandingConfig(newConfig, 'superadmin', 'superadmin@websapmax.com');
      mutate(CONFIG_KEY);
    } catch (error) {
      mutate(CONFIG_KEY); 
      console.error("Failed to update landing config:", error);
      throw error;
    }
  }, [mutate]);

  return {
    config: data,
    isLoading,
    isError: !!error,
    error,
    updateConfig,
  };
}

export function useDefaultConfig() {
  return useMemo(() => landingConfigService.getDefaultConfig(), []);
}
