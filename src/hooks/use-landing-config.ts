
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
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

export function useLandingConfig(): UseLandingConfigReturn {
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const defaultConfig = useDefaultConfig();

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      // Intenta obtener la configuración de la base de datos
      const dbConfig = await landingConfigService.getLandingConfig();
      if (dbConfig) {
        setConfig(dbConfig);
      } else {
        // Si no hay configuración en la BD, usa la por defecto
        setConfig(defaultConfig);
        console.warn("No se encontró configuración en la base de datos, se utilizó la configuración por defecto.");
      }
    } catch (e: any) {
      console.error("Error al obtener la configuración de la landing, usando la de por defecto.", e);
      setError(e.message || "No se pudo cargar la configuración.");
      setIsError(true);
      setConfig(defaultConfig); // Usa la configuración por defecto como fallback en caso de error
    } finally {
      setIsLoading(false);
    }
  }, [defaultConfig]);

  useEffect(() => {
    fetchConfig();

    // Listener para actualizaciones en tiempo real
    const configRef = doc(db, 'landing_configs', 'main');
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        const updatedData = doc.data() as LandingConfig;
        setConfig({ ...defaultConfig, ...updatedData });
      }
    }, (err) => {
        console.error("Error con el listener de la configuración: ", err);
        setError("Error de conexión en tiempo real.");
        setIsError(true);
    });

    return () => unsubscribe();
  }, [fetchConfig, defaultConfig]);


  return {
    config,
    isLoading,
    isError,
    error,
    retry: fetchConfig
  };
}
