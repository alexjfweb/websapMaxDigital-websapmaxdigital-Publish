
"use client";

import useSWR from 'swr';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';
import { useToast } from './use-toast';

const SWR_KEY = 'landing-page-config';

// El fetcher ahora es más simple, solo obtiene los datos.
const fetcher = () => landingConfigService.getLandingConfig();

export function useLandingConfig() {
  const { toast } = useToast();
  
  const { data, error, isLoading, mutate } = useSWR<LandingConfig, Error>(
    SWR_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false, // Previene reintentos automáticos que puedan ocultar un problema persistente.
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

  // Función de actualización que requiere la información del usuario en el momento de la llamada.
  const updateConfig = async (configUpdate: Partial<LandingConfig>, userId: string, userEmail: string) => {
    if (!userId || !userEmail) {
      throw new Error("Usuario no autenticado para realizar la actualización.");
    }
    
    // Se usa `data` (del SWR) o se obtiene el por defecto si `data` es undefined.
    const currentData = data || landingConfigService.getDefaultConfig();
    const newData = { ...currentData, ...configUpdate };

    // Actualización optimista de la UI.
    await mutate(newData, false);

    try {
        await landingConfigService.updateLandingConfig(configUpdate, userId, userEmail);
        // Revalida los datos desde el servidor para asegurar consistencia.
        await mutate();
    } catch (e) {
        // Si la actualización falla, revierte la UI al estado original.
        toast({
          title: "Error al Guardar",
          description: "No se pudieron guardar los cambios. Revirtiendo.",
          variant: "destructive",
        });
        await mutate(currentData, false);
        throw e;
    }
  };

  // Lógica de resiliencia: si hay un error o no hay datos, se usa la config por defecto.
  const configToShow = error || !data ? landingConfigService.getDefaultConfig() : data;

  return {
    landingConfig: configToShow,
    isLoading: isLoading && !error && !data, // El estado de carga es verdadero solo al principio.
    error: error || null,
    updateConfig,
    refetch: mutate,
  };
}

