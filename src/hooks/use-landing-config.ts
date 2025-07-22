"use client";

import { useState, useEffect } from 'react';
import { landingConfigService, type LandingConfig, type CreateLandingConfigRequest } from '@/services/landing-config-service';

// Hook para obtener la configuración de la landing
export function useLandingConfig() {
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = landingConfigService.subscribeToLandingConfig(async (landingConfig) => {
      if (landingConfig) {
        setConfig(landingConfig);
        setIsLoading(false);
        setError(null);
      } else {
        // Si no hay configuración, crear una por defecto
        try {
          console.log('No se encontró configuración, creando configuración por defecto...');
          const defaultConfig = landingConfigService.getDefaultConfig();
          const newConfig = await landingConfigService.createLandingConfig(
            defaultConfig,
            'system',
            'system@websapmax.com'
          );
          setConfig(newConfig);
          setIsLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error al crear configuración por defecto:', err);
          setError('Error al inicializar la configuración');
          setIsLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const updateConfig = async (data: Partial<CreateLandingConfigRequest>) => {
    if (!config) return;
    
    try {
      const updatedConfig = await landingConfigService.updateLandingConfig(
        { id: config.id, ...data },
        'system',
        'system@websapmax.com'
      );
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      console.error('Error updating config:', err);
      throw err;
    }
  };

  const createConfig = async (data: CreateLandingConfigRequest) => {
    try {
      const newConfig = await landingConfigService.createLandingConfig(
        data,
        'system',
        'system@websapmax.com'
      );
      setConfig(newConfig);
      return newConfig;
    } catch (err) {
      console.error('Error creating config:', err);
      throw err;
    }
  };

  return {
    config,
    isLoading,
    error,
    updateConfig,
    createConfig
  };
}

// Hook para obtener la configuración por defecto
export function useDefaultConfig() {
  return landingConfigService.getDefaultConfig();
} 