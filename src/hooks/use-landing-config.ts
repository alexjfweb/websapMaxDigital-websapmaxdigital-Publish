
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig, getLandingDefaultConfig } from '@/services/landing-config-service';
import { useToast } from './use-toast';

const SWR_KEY = 'landing-config';

// Fetcher function that calls the service
const fetcher = () => landingConfigService.getLandingConfig();

export function useLandingConfig() {
  const { data, error, isLoading, mutate } = useSWR<LandingConfig>(SWR_KEY, fetcher, {
    revalidateOnFocus: false,
  });
  const { toast } = useToast();

  const updateConfig = async (newConfig: Partial<LandingConfig>) => {
    try {
      // Optimistic UI update
      mutate({ ...data, ...newConfig } as LandingConfig, false);
      
      // Perform the actual update
      await landingConfigService.updateLandingConfig(newConfig, 'superadmin-user', 'superadmin@example.com');
      
      // Revalidate to get the fresh data from the server
      mutate();
    } catch (err: any) {
      toast({
        title: "Error al actualizar",
        description: err.message,
        variant: "destructive"
      });
      // Rollback on error
      mutate();
    }
  };

  return {
    config: data,
    isLoading,
    isError: !!error,
    updateConfig,
  };
}

export function useDefaultConfig() {
    return getLandingDefaultConfig();
}
