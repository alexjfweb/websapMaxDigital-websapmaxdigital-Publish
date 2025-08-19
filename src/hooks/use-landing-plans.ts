
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
            // Intenta parsear el error del cuerpo de la respuesta, si existe
            const errorBody = await res.json();
            error.message = errorBody.error || 'Failed to fetch plans';
        } catch (e) {
            // Si el cuerpo no es JSON o está vacío, usa el texto de estado
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
  const swrKey = publicOnly ? '/api/landing-plans' : 'admin/all-plans';
  const swrFetcher = publicOnly ? fetcher : adminFetcher;

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    swrKey,
    swrFetcher,
    {
      revalidateOnFocus: false, // Desactivado para evitar recargas inesperadas en el admin
      shouldRetryOnError: false, // Evitar reintentos que puedan ocultar errores persistentes
    }
  );

  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    plans: data || [],
    isLoading: isLoading && !data && !error,
    error: error ? error.message : null,
    refetch,
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
