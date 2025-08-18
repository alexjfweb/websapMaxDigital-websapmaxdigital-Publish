
"use client";

import { useState, useEffect } from 'react';
import type { LandingConfig } from '@/services/landing-config-service';
import { landingConfigService } from '@/services/landing-config-service';

interface UseLandingConfigReturn {
  config: LandingConfig | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  retry: () => void;
}

export function useDefaultConfig(): LandingConfig {
    return landingConfigService.getDefaultConfig();
}

// Hook optimizado para devolver siempre la configuración por defecto sin acceder a Firestore.
// Esto evita problemas de permisos en la carga inicial para usuarios no autenticados.
export function useLandingConfig(): UseLandingConfigReturn {
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para establecer la configuración por defecto.
  const loadDefaultConfig = () => {
    try {
      const defaultConfig = landingConfigService.getDefaultConfig();
      setConfig(defaultConfig);
    } catch (e) {
      // Aunque es improbable, maneja el caso en que la config por defecto falle.
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDefaultConfig();
  }, []);


  return {
    config,
    isLoading,
    isError: false, // No hay llamada a BD, no hay error de fetch.
    error: null,
    retry: loadDefaultConfig // La función de reintento simplemente recarga la config por defecto.
  };
}
