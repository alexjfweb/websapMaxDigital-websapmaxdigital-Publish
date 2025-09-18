
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';
import { useToast } from './use-toast';
import { useState, useEffect } from 'react';

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
    setIsSaving(true);
    try {
      console.log('🔄 Iniciando guardado multipart...');
      await landingConfigService.updateLandingConfig(configUpdate, userId, userEmail);
      
      await mutate(
        async () => {
          const freshData = await landingConfigService.getLandingConfig();
          console.log('📊 Datos reconstruidos desde Firestore:', freshData);
          return freshData;
        },
        {
          rollbackOnError: false,
          revalidate: false,
        }
      );
      
      console.log('✅ Guardado y sincronización completados');
      
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
    refetch: mutate,
  };
}
