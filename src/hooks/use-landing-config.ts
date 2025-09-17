
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';

const SWR_KEY = 'landing-page-config';

const fetcher = () => landingConfigService.getLandingConfig();

export function useLandingConfig() {
  const { data, error, isLoading, mutate } = useSWR<LandingConfig, Error>(
    SWR_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const updateConfig = async (configUpdate: Partial<LandingConfig>, userId?: string, userEmail?: string) => {
    if (!userId || !userEmail) {
      throw new Error("Usuario no autenticado para realizar la actualización.");
    }
    
    const currentData = data || landingConfigService.getDefaultConfig();
    const newData = { ...currentData, ...configUpdate };

    // Actualización optimista
    await mutate(newData, false);

    try {
        await landingConfigService.updateLandingConfig(
            configUpdate,
            userId,
            userEmail
        );
        // Revalida para asegurar consistencia
        mutate();
    } catch (e) {
        // Si falla, revierte al estado original
        await mutate(currentData, false);
        throw e;
    }
  };

  return {
    landingConfig: data || landingConfigService.getDefaultConfig(),
    isLoading,
    isError: !!error,
    error: error || null,
    updateConfig,
    refetch: mutate,
  };
}

