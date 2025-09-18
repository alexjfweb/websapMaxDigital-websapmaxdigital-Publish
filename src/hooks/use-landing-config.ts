
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';
import { useToast } from './use-toast';

const SWR_KEY = 'landing-page-config';

// El fetcher ahora es más simple, solo obtiene los datos.
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
    
    // Realiza una actualización optimista para una UI más rápida
    const currentData = data || landingConfigService.getDefaultConfig();
    const newData = { ...currentData, ...configUpdate };
    // El 'false' al final evita una revalidación automática inmediata
    await mutate(newData, false);

    try {
        await landingConfigService.updateLandingConfig(configUpdate, userId, userEmail);
        // Ahora, tras el guardado exitoso, forzamos una revalidación para obtener los datos frescos de la BD
        await mutate();
    } catch (e: any) {
        toast({
          title: "Error al Guardar",
          description: `No se pudieron guardar los cambios: ${e.message}`,
          variant: "destructive",
        });
        // Si el guardado falla, revertimos al estado original
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
