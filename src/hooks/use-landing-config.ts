
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
    
    try {
        // Llama al servicio para guardar los datos. Este servicio ahora maneja la división.
        await landingConfigService.updateLandingConfig(configUpdate, userId, userEmail);
        
        // Después de un guardado exitoso, revalida los datos para obtener la versión más reciente
        // y reconstruida desde Firestore. Esto actualizará la UI correctamente.
        await mutate();

    } catch (e: any) {
        toast({
          title: "Error al Guardar",
          description: `No se pudieron guardar los cambios: ${e.message}`,
          variant: "destructive",
        });
        // No se revierte el estado localmente para evitar más inconsistencias, 
        // se confía en la próxima revalidación o en una recarga manual.
        throw e;
    }
  };

  // Si hay un error en la carga inicial o no hay datos, usa la configuración por defecto.
  // Esto asegura que `landingConfig` nunca sea `null` o `undefined` para el componente.
  const configToShow = error || !data ? landingConfigService.getDefaultConfig() : data;

  return {
    landingConfig: configToShow,
    // El estado de carga es verdadero solo al principio, si no hay datos ni error.
    isLoading: isLoading && !data && !error,
    error: error || null,
    updateConfig,
    refetch: mutate,
  };
}
