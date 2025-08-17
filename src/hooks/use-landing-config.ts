
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { LandingConfig } from '@/services/landing-config-service';

interface UseLandingConfigReturn {
  config: LandingConfig | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  retry: () => void;
}

export function useLandingConfig(): UseLandingConfigReturn {
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchConfig = useCallback(async (attempt: number = 0): Promise<() => void> => {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s

    return new Promise(async (resolve, reject) => {
        let unsubscribe: (() => void) | null = null;
        try {
            setIsLoading(true);
            setIsError(false);
            setError(null);

            console.log(`🔄 [useLandingConfig] Intento ${attempt + 1} de carga...`);

            const timeoutPromise = new Promise<never>((_, rejectTimeout) => {
                setTimeout(() => rejectTimeout(new Error('Timeout al cargar configuración')), 10000);
            });

            const fetchPromise = (async () => {
                const configRef = doc(db, 'landing_configs', 'main');
                const configSnap = await getDoc(configRef);
                
                if (!configSnap.exists()) {
                  throw new Error('Documento de configuración no encontrado');
                }
                
                const data = configSnap.data() as LandingConfig;
                
                if (!data) throw new Error('Datos de configuración vacíos');
                if (!data.heroTitle) throw new Error('Configuración incompleta: falta heroTitle');
                if (!data.sections || !Array.isArray(data.sections)) throw new Error('Configuración incompleta: falta sections');
                if (!data.seo) throw new Error('Configuración incompleta: falta SEO');

                return data;
            })();

            const configData = await Promise.race([fetchPromise, timeoutPromise]);
            
            setConfig(configData);
            setIsLoading(false);
            setRetryCount(0);
            
            console.log('✅ [useLandingConfig] Configuración cargada exitosamente');

            const configRef = doc(db, 'landing_configs', 'main');
            unsubscribe = onSnapshot(configRef, 
                (doc) => {
                if (doc.exists()) {
                    const updatedData = doc.data() as LandingConfig;
                    if (updatedData && updatedData.heroTitle) {
                      setConfig(updatedData);
                      console.log('🔄 [useLandingConfig] Configuración actualizada en tiempo real');
                    }
                }
                },
                (error) => {
                  console.error('❌ [useLandingConfig] Error en listener:', error);
                }
            );

            resolve(() => { if (unsubscribe) unsubscribe(); });

        } catch (fetchError) {
            const errorMessage = fetchError instanceof Error ? fetchError.message : 'Error desconocido';
            console.error(`❌ [useLandingConfig] Error en intento ${attempt + 1}:`, errorMessage);

            if (attempt < maxRetries) {
                console.log(`⏳ [useLandingConfig] Reintentando en ${retryDelay}ms...`);
                setTimeout(() => {
                    setRetryCount(attempt + 1);
                    fetchConfig(attempt + 1).then(resolve).catch(reject);
                }, retryDelay);
            } else {
                setIsError(true);
                setError(errorMessage);
                setIsLoading(false);
                console.error('💥 [useLandingConfig] Todos los intentos fallaron');
                reject(new Error(errorMessage));
            }
        }
    });
  }, []);

  const retry = useCallback(() => {
    setRetryCount(0);
    fetchConfig(0);
  }, [fetchConfig]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    fetchConfig(0).then((unsub) => {
      if (typeof unsub === 'function') {
        unsubscribe = unsub;
      }
    }).catch(err => {
        console.error("Fallo final en useEffect", err);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchConfig]);

  return {
    config,
    isLoading,
    isError,
    error,
    retry
  };
}
