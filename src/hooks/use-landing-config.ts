
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';
import { useToast } from './use-toast';

const SWR_KEY = 'landing-page-config';

const fetcher = () => landingConfigService.getLandingConfig();

export function useLandingConfig() {
  const { toast } = useToast();
  
  const { data, error, isLoading, mutate } = useSWR<LandingConfig | null, Error>(
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
    
    try {
      await landingConfigService.updateLandingConfig(configUpdate, userId, userEmail);
      // Forzar la revalidación de los datos desde el servidor.
      // Esto ejecutará el 'fetcher' nuevamente, que a su vez llamará a 'readMultiPartDocument'.
      await mutate();

    } catch (e: any) {
        toast({
          title: "Error al Guardar",
          description: `No se pudieron guardar los cambios: ${e.message}`,
          variant: "destructive",
        });
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
