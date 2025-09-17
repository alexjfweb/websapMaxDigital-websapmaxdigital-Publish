
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';
import { useSession } from '@/contexts/session-context';

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

  const { currentUser } = useSession();

  const updateConfig = async (configUpdate: Partial<LandingConfig>) => {
    if (!currentUser) {
      throw new Error("Usuario no autenticado.");
    }
    // Asegurarse de que los datos actuales están cargados antes de mutar
    const currentData = data || landingConfigService.getDefaultConfig();
    const newData = { ...currentData, ...configUpdate };

    // Actualización optimista: actualiza la UI inmediatamente
    await mutate(newData, false);

    // Llama al servicio para persistir los cambios
    try {
        await landingConfigService.updateLandingConfig(
            configUpdate,
            currentUser.id,
            currentUser.email
        );
        // Revalida para asegurar que los datos son consistentes con el backend
        mutate();
    } catch (e) {
        // Si la actualización falla, revierte al estado original
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
