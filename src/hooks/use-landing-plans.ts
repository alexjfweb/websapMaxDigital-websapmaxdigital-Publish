
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import type { LandingPlan } from '@/types/plans';

interface UseLandingPlansReturn {
  plans: LandingPlan[] | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useLandingPlans(publicOnly: boolean = true): UseLandingPlansReturn {
  const [plans, setPlans] = useState<LandingPlan[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchPlans = useCallback(async (attempt: number = 0): Promise<() => void> => {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, attempt) * 1000;

    return new Promise(async (resolve, reject) => {
        let unsubscribe: (() => void) | null = null;
        try {
            setIsLoading(true);
            setError(null);

            console.log(`🔄 [useLandingPlans] Intento ${attempt + 1} de carga...`);

            const timeoutPromise = new Promise<never>((_, rejectTimeout) => {
                setTimeout(() => rejectTimeout(new Error('Timeout al cargar planes')), 8000);
            });

            const fetchPromise = (async () => {
                const plansCollection = collection(db, 'landingPlans');
                const q = publicOnly 
                ? query(plansCollection, where('isPublic', '==', true), where('isActive', '==', true))
                : query(plansCollection);
                
                const querySnapshot = await getDocs(q);
                
                const plansData = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }) as LandingPlan)
                    .sort((a,b) => a.order - b.order);

                if (!Array.isArray(plansData)) {
                    throw new Error('Formato de datos de planes inválido');
                }

                return plansData;
            })();

            const plansData = await Promise.race([fetchPromise, timeoutPromise]);
            
            setPlans(plansData);
            setIsLoading(false);
            setRetryCount(0);
            
            console.log(`✅ [useLandingPlans] ${plansData.length} planes cargados exitosamente`);

            const plansCollection = collection(db, 'landingPlans');
            const q = publicOnly 
                ? query(plansCollection, where('isPublic', '==', true), where('isActive', '==', true))
                : query(plansCollection);

            unsubscribe = onSnapshot(q,
                (snapshot) => {
                const updatedPlans = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }) as LandingPlan)
                    .sort((a,b) => a.order - b.order);
                
                setPlans(updatedPlans);
                console.log(`🔄 [useLandingPlans] ${updatedPlans.length} planes actualizados en tiempo real`);
                },
                (error) => {
                console.error('❌ [useLandingPlans] Error en listener:', error);
                }
            );

            resolve(() => { if (unsubscribe) unsubscribe(); });

        } catch (fetchError) {
            const errorMessage = fetchError instanceof Error ? fetchError.message : 'Error desconocido';
            console.error(`❌ [useLandingPlans] Error en intento ${attempt + 1}:`, errorMessage);

            if (attempt < maxRetries) {
                console.log(`⏳ [useLandingPlans] Reintentando en ${retryDelay}ms...`);
                setTimeout(() => {
                    setRetryCount(attempt + 1);
                    fetchPlans(attempt + 1).then(resolve).catch(reject);
                }, retryDelay);
            } else {
                setError(errorMessage);
                setIsLoading(false);
                console.error('💥 [useLandingPlans] Todos los intentos fallaron');
                reject(new Error(errorMessage));
            }
        }
    });
  }, [publicOnly]);

  const retry = useCallback(() => {
    setRetryCount(0);
    fetchPlans(0);
  }, [fetchPlans]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    fetchPlans(0).then((unsub) => {
      if (typeof unsub === 'function') {
        unsubscribe = unsub;
      }
    }).catch(err => {
        console.error("Fallo final de fetchPlans en useEffect", err);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchPlans]);

  return {
    plans,
    isLoading,
    error,
    retry
  };
}
