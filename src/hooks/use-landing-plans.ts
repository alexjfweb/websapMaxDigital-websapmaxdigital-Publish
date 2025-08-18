
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { LandingPlan } from '@/types/plans';
import useSWR from 'swr';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        // Attach extra info to the error object.
        try {
            error.message = (await res.json()).error || 'Failed to fetch plans';
        } catch (e) {
            // Ignore if response is not JSON
        }
        throw error;
    }
    return res.json();
};


interface UseLandingPlansReturn {
  plans: LandingPlan[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useLandingPlans(publicOnly: boolean = true): UseLandingPlansReturn {
  const { data, error, isLoading, mutate, isValidating } = useSWR(
    publicOnly ? '/api/landing-plans' : null, // Solo hace fetch si es para la landing pública
    fetcher,
    {
      revalidateOnFocus: false, // Evita re-fetch innecesarios
      shouldRetryOnError: false, // El reintento se maneja manualmente
    }
  );

  const retry = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    plans: data || [],
    isLoading: isLoading || isValidating,
    error: error ? error.message : null,
    retry,
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

