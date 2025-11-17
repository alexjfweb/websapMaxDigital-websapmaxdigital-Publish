// src/hooks/use-ai-config.ts
"use client";

import useSWR from 'swr';
import { aiConfigService, AIConfig } from '@/services/ai-config-service';
import { useToast } from './use-toast';

const SWR_KEY = 'ai-config';

// El fetcher ahora llama al servicio que interactúa con Firestore
const fetcher = () => aiConfigService.getAIConfig();

export function useAIConfig() {
  const { toast } = useToast();
  
  const { data, error, isLoading, mutate } = useSWR<AIConfig, Error>(
    SWR_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err) => {
        console.error("SWR Error fetching AI config:", err);
        toast({
          title: "Error de Carga",
          description: "No se pudo obtener la configuración de IA. Se usarán valores por defecto.",
          variant: "destructive"
        });
      }
    }
  );

  const updateConfig = async (newConfig: AIConfig) => {
    try {
      // Optimistic UI: actualiza el cache local inmediatamente
      await mutate(newConfig, false);
      
      // Llama al servicio para guardar los cambios en Firestore
      await aiConfigService.updateAIConfig(newConfig);
      
      // Revalida para asegurar que los datos locales estén sincronizados con el servidor
      await mutate();

      toast({
        title: "Éxito",
        description: "Configuración de IA guardada correctamente.",
      });

    } catch (e: any) {
        toast({
          title: "Error al Guardar",
          description: `No se pudieron guardar los cambios: ${e.message}`,
          variant: "destructive",
        });
        // Si falla, revierte al estado anterior
        await mutate();
        throw e;
    }
  };

  return {
    aiConfig: data,
    isLoading: isLoading && !data && !error,
    error: error || null,
    updateAIConfig: updateConfig,
  };
}
