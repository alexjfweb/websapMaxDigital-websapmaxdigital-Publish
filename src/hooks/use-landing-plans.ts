
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { LandingPlan } from '@/types/plans';
import useSWR from 'swr';
import { landingPlansService } from '@/services/landing-plans-service';

// Fetcher para la API pública (solo planes activos)
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        try {
            error.message = (await res.json()).error || 'Failed to fetch plans';
        } catch (e) {
            // Ignore if response is not JSON
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
  refetch: () => void; // Renombrado de retry a refetch para mayor claridad
}

export function useLandingPlans(publicOnly: boolean = true): UseLandingPlansReturn {
  // La clave SWR ahora depende de si queremos los planes públicos o todos
  const swrKey = publicOnly ? '/api/landing-plans' : 'admin/all-plans';
  const swrFetcher = publicOnly ? fetcher : adminFetcher;

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    swrKey,
    swrFetcher,
    {
      revalidateOnFocus: false, 
      shouldRetryOnError: false, 
    }
  );

  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    plans: data || [],
    isLoading: isLoading || isValidating,
    error: error ? error.message : null,
    refetch, // Exportar la función para refrescar
  };
}


// --- HOOKS PARA OPERACIONES CRUD (USO EN PANEL DE ADMIN) ---
// Estos hooks no son necesarios si las operaciones se hacen con Server Actions,
// pero son útiles si se prefiere una API REST.

export const usePlanState = () => {
    const [selectedPlan, setSelectedPlan] = useState<LandingPlan | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const startEditing = (plan: LandingPlan) => {
        setSelectedPlan(plan);
        setIsFormOpen(true);
    };

    const startCreating = () => {
        setSelectedPlan(null);
        setIsFormOpen(true);
    };

    const cancelEdit = () => {
        setSelectedPlan(null);
        setIsFormOpen(false);
    };

    return {
        selectedPlan,
        isEditing: !!selectedPlan,
        isCreating: !selectedPlan && isFormOpen,
        isFormOpen,
        startEditing,
        startCreating,
        cancelEdit,
    };
}


export const useLandingPlansCRUD = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    // Aquí irían las funciones para llamar a la API
    // Ejemplo:
    const createPlan = async (data: any, userId: string, userEmail: string) => {
        setIsLoading(true);
        // ... Lógica de fetch a POST /api/landing-plans
        setIsLoading(false);
    };
    
    // ... update, delete, reorder

    return { createPlan, /* ... */ isLoading };
};

export const usePlanAuditLogs = (planId: string | null) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch logs
    const rollbackPlan = async (auditLogId: string, userId: string, userEmail: string) => {};

    return { logs, isLoading, error, rollbackPlan };
};
