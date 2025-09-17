
"use client";

import { useCallback } from 'react';
import type { LandingPlan } from '@/types/plans';
import useSWR from 'swr';
import { landingPlansService } from '@/services/landing-plans-service';
import { useToast } from './use-toast';

// Fetcher para la API pública (solo planes activos)
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        try {
            const errorBody = await res.json();
            error.message = errorBody.error || 'Failed to fetch plans';
        } catch (e) {
            error.message = res.statusText;
        }
        throw error;
    }
    return res.json();
};

// Fetcher para el panel de admin (todos los planes)
const adminFetcher = async () => {
  return landingPlansService.getPlans();
};


interface UseLandingPlansReturn {
  plans: LandingPlan[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLandingPlans(publicOnly: boolean = true): UseLandingPlansReturn {
  const { toast } = useToast();
  const swrKey = publicOnly ? '/api/landing-plans' : 'admin/all-plans';
  const swrFetcher = publicOnly ? fetcher : adminFetcher;

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    swrFetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: (err) => {
        console.error(`SWR Error fetching plans (publicOnly: ${publicOnly}):`, err);
        // No mostramos un toast aquí para no ser intrusivos; el componente se encargará del mensaje.
      }
    }
  );

  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    // Si hay un error, devolvemos un array vacío para no romper la UI
    plans: data || [],
    // El estado de carga solo es relevante si aún no hay datos ni error
    isLoading: isLoading && !data && !error,
    error: error ? error.message : null,
    refetch,
  };
}
