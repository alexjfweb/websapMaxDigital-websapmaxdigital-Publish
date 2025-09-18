
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';
import { useToast } from './use-toast';
import { useState } from 'react';

const SWR_KEY = 'landing-page-config';

const fetcher = () => landingConfigService.getLandingConfig();

export function useLandingConfig() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const { data, error, isLoading, mutate } = useSWR<LandingConfig | null, Error>(
    SWR_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
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
    setIsSaving(true);
    try {
      // Directamente llama al servicio para guardar la configuración
      await landingConfigService.updateLandingConfig(configUpdate, userId, userEmail);
      
      // Forzar la revalidación para obtener los datos reconstruidos desde el servidor
      await mutate();
      
      toast({
        title: "Éxito",
        description: "Configuración de la landing guardada correctamente",
      });

    } catch (e: any) {
        toast({
          title: "Error al Guardar",
          description: `No se pudieron guardar los cambios: ${e.message}`,
          variant: "destructive",
        });
        throw e; // Relanzar el error para que el componente que llama pueda manejarlo si es necesario
    } finally {
        setIsSaving(false);
    }
  };

  // Si hay un error o no hay datos, usa la configuración por defecto.
  const configToShow = error || !data ? landingConfigService.getDefaultConfig() : data;

  return {
    landingConfig: configToShow,
    isLoading: isLoading && !data && !error,
    isSaving,
    error: error || null,
    updateConfig,
    refetch: mutate,
  };
}
