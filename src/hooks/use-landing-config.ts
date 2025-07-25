
"use client";

import useSWR, { useSWRConfig } from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';
import { useCallback, useMemo } from 'react';

const CONFIG_KEY = 'landing-config';

// Fetcher para SWR
const fetcher = () => landingConfigService.getLandingConfig();

/**
 * Hook para obtener la configuración de la landing page.
 * Proporciona el estado de carga y una función para actualizar la configuración.
 */
export function useLandingConfig() {
  const { data, error, isLoading } = useSWR<LandingConfig | null>(CONFIG_KEY, fetcher, {
    revalidateOnFocus: false,
  });
  const { mutate } = useSWRConfig();

  const updateConfig = useCallback(async (newConfig: Partial<LandingConfig>) => {
    // Optimistic UI: actualiza los datos locales inmediatamente
    mutate(CONFIG_KEY, (currentConfig) => ({ ...currentConfig, ...newConfig }), false);

    try {
      // Intenta guardar los cambios en el backend
      await landingConfigService.updateLandingConfig(newConfig, 'superadmin', 'superadmin@websapmax.com');
      // Revalida para obtener los datos más recientes del servidor
      mutate(CONFIG_KEY);
    } catch (error) {
      // Si falla, revierte al estado anterior
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

/**
 * Hook para obtener la configuración por defecto de la landing.
 * Útil para inicializar formularios o restaurar valores.
 */
export function useDefaultConfig() {
  // Usamos useMemo para evitar que se cree un nuevo objeto en cada render,
  // lo cual puede causar bucles infinitos en useEffect.
  return useMemo(() => landingConfigService.getDefaultConfig(), []);
}
