
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';
import { useToast } from './use-toast';
import { useSession } from '@/contexts/session-context';

const SWR_KEY = 'landing-page-config';

// El fetcher ahora es más simple, solo obtiene los datos.
const fetcher = () => landingConfigService.getLandingConfig();

export function useLandingConfig() {
  const { toast } = useToast();
  const { currentUser } = useSession();
  
  const { data, error, isLoading, mutate } = useSWR<LandingConfig, Error>(
    SWR_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false, 
      onError: (err) => {
        console.error("SWR Error fetching landing config:", err);
        toast({
          title: "Error de Carga",
          description: "No se pudo obtener la configuración de la página. Se usarán valores por defecto.",
          variant: "destructive"
        })
      }
    }
  );

  const updateConfig = async (configUpdate: Partial<LandingConfig>, userId: string, userEmail: string) => {
    if (!userId || !userEmail) {
      throw new Error("Usuario no autenticado para realizar la actualización.");
    }
    
    const currentData = data || landingConfigService.getDefaultConfig();
    const newData = { ...currentData, ...configUpdate };

    await mutate(newData, false);

    try {
        await landingConfigService.updateLandingConfig(configUpdate, userId, userEmail);
        await mutate();
    } catch (e) {
        toast({
          title: "Error al Guardar",
          description: "No se pudieron guardar los cambios. Revirtiendo.",
          variant: "destructive",
        });
        await mutate(currentData, false);
        throw e;
    }
  };

  const configToShow = error || !data ? landingConfigService.getDefaultConfig() : data;

  return {
    landingConfig: configToShow,
    isLoading: isLoading && !data && !error,
    error: error || null,
    updateConfig,
    refetch: mutate,
  };
}

