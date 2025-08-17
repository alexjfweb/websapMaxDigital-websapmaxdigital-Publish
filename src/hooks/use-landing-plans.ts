
import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { landingPlansService, LandingPlan, CreatePlanRequest, UpdatePlanRequest, PlanAuditLog } from '@/services/landing-plans-service';

// El fetcher ahora llama al endpoint de la API
const fetcher = async (url: string): Promise<LandingPlan[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); // Intenta parsear el error, si falla, devuelve objeto vacío
    throw new Error(errorData.error || 'No se pudieron cargar los planes.');
  }
  return res.json();
};

// Hook para obtener planes. Ahora puede obtener todos o solo los públicos via API.
export function useLandingPlans(publicOnly = false) {
  // El SWR key es ahora la URL del endpoint
  const swrKey = publicOnly ? '/api/landing-plans' : null; // Por ahora solo soportamos público

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
      revalidateOnFocus: false, // Puedes ajustar esto según necesites
  });

  return {
    plans: data || [],
    isLoading,
    error: error ? error.message : null,
    refetch: mutate,
  };
}


// Hook para obtener un plan específico
export function useLandingPlan(id: string) {
  const { data, error, isLoading } = useSWR(id ? `landing-plan-${id}` : null, () => landingPlansService.getPlanById(id));

  return { 
    plan: data, 
    isLoading, 
    error: error ? error.message : null
  };
}

// Hook para operaciones CRUD
export function useLandingPlansCRUD() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlan = useCallback(async (
    data: CreatePlanRequest,
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await landingPlansService.createPlan(data, userId, userEmail, ipAddress, userAgent);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (
    id: string,
    data: UpdatePlanRequest,
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await landingPlansService.updatePlan(id, data, userId, userEmail, ipAddress, userAgent);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePlan = useCallback(async (
    id: string,
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await landingPlansService.deletePlan(id, userId, userEmail, ipAddress, userAgent);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reorderPlans = useCallback(async (
    planIds: string[],
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await landingPlansService.reorderPlans(planIds, userId, userEmail, ipAddress, userAgent);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createPlan,
    updatePlan,
    deletePlan,
    reorderPlans,
    isLoading,
    error
  };
}

// Hook para historial de auditoría
export function usePlanAuditLogs(planId: string) {
  const [logs, setLogs] = useState<PlanAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    landingPlansService.getPlanAuditLogs(planId)
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [planId]);

  const rollbackPlan = useCallback(async (
    auditLogId: string,
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await landingPlansService.rollbackPlan(planId, auditLogId, userId, userEmail, ipAddress, userAgent);
      // Recargar logs después del rollback
      const updatedLogs = await landingPlansService.getPlanAuditLogs(planId);
      setLogs(updatedLogs);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  return {
    logs,
    isLoading,
    error,
    rollbackPlan
  };
}

// Hook para gestión de estado local
export function usePlanState() {
  const [selectedPlan, setSelectedPlan] = useState<LandingPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const startEditing = useCallback((plan: LandingPlan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
    setIsCreating(false);
  }, []);

  const startCreating = useCallback(() => {
    setSelectedPlan(null);
    setIsCreating(true);
    setIsEditing(false);
  }, []);

  const cancelEdit = useCallback(() => {
    setSelectedPlan(null);
    setIsEditing(false);
    setIsCreating(false);
  }, []);

  return {
    selectedPlan,
    isEditing,
    isCreating,
    startEditing,
    startCreating,
    cancelEdit
  };
}
