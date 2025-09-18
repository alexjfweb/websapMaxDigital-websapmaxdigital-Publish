"use client";

import useSWR, { mutate } from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';
import { useToast } from './use-toast';
import { useState, useEffect } from 'react';

const SWR_KEY = 'landing-page-config';

const fetcher = () => landingConfigService.getLandingConfig();

export function useLandingConfig() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<string>('');
  
  const { data, error, isLoading, mutate: revalidate } = useSWR<LandingConfig | null, Error>(
    SWR_KEY,
    fetcher,
    {
      revalidateOnFocus: true, // Revalida cuando el usuario vuelve a la pestaña
      revalidateOnReconnect: true,
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
      const currentHeroContent = configUpdate.heroContent || '';
      
      await landingConfigService.updateLandingConfig(configUpdate, userId, userEmail);
      
      // La clave para la sincronización global:
      // Disparamos una revalidación global de la clave SWR.
      // Esto notificará a todas las instancias de useSWR con esta clave (incluida la de la página de inicio)
      // que sus datos están desactualizados y deben volver a buscarlos.
      await mutate(SWR_KEY);
      
      setLastSavedContent(currentHeroContent); // Aún útil para depuración

    } catch (e: any) {
        toast({
          title: "Error al Guardar",
          description: `No se pudieron guardar los cambios: ${e.message}`,
          variant: "destructive",
        });
        throw e;
    } finally {
        setIsSaving(false);
    }
  };

  const configToShow = error || !data ? landingConfigService.getDefaultConfig() : data;

  return {
    landingConfig: configToShow,
    isLoading: isLoading && !data && !error,
    isSaving,
    error: error || null,
    updateConfig,
    refetch: revalidate,
    lastSavedContent,
  };
}
