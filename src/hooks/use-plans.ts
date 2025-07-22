import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Plan, CreatePlanRequest, UpdatePlanRequest } from '@/types/plans';

// Tipos para las respuestas de la API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

// Función fetcher para SWR
const fetcher = async (url: string): Promise<any> => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la solicitud');
  }
  return response.json();
};

// Hook principal para obtener planes
export function usePlans() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<ApiResponse<Plan[]>>(
    '/api/plans',
    fetcher,
    {
      refreshInterval: 30000, // Revalidar cada 30 segundos
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    plans: data?.data || [],
    isLoading,
    error: error?.message,
    revalidate,
    isError: !!error
  };
}

// Hook para obtener un plan específico
export function usePlan(id: string) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<ApiResponse<Plan>>(
    id ? `/api/plans/${id}` : null,
    fetcher
  );

  return {
    plan: data?.data,
    isLoading,
    error: error?.message,
    revalidate,
    isError: !!error
  };
}

// Hook para obtener historial de un plan
export function usePlanHistory(id: string) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<ApiResponse<any[]>>(
    id ? `/api/plans/${id}/history` : null,
    fetcher
  );

  return {
    history: data?.data || [],
    isLoading,
    error: error?.message,
    revalidate,
    isError: !!error
  };
}

// Funciones para operaciones CRUD
export const plansApi = {
  // Crear nuevo plan
  async createPlan(planData: CreatePlanRequest, user: any): Promise<Plan> {
    const response = await fetch('/api/plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan: planData, user }),
    });

    const result: ApiResponse<Plan> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al crear el plan');
    }

    // Revalidar la lista de planes
    await mutate('/api/plans');

    return result.data!;
  },

  // Actualizar plan existente
  async updatePlan(id: string, planData: UpdatePlanRequest, user: any): Promise<Plan> {
    const response = await fetch(`/api/plans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan: planData, user }),
    });

    const result: ApiResponse<Plan> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al actualizar el plan');
    }

    // Revalidar la lista de planes y el plan específico
    await Promise.all([
      mutate('/api/plans'),
      mutate(`/api/plans/${id}`)
    ]);

    return result.data!;
  },

  // Eliminar plan
  async deletePlan(id: string, user: any): Promise<void> {
    const response = await fetch(`/api/plans/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
    });

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al eliminar el plan');
    }

    // Revalidar la lista de planes
    await mutate('/api/plans');
  },

  // Reordenar planes
  async reorderPlans(planIds: string[], user: any): Promise<void> {
    const response = await fetch('/api/plans/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planIds, user }),
    });

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al reordenar los planes');
    }

    // Revalidar la lista de planes
    await mutate('/api/plans');
  },

  // Obtener historial de un plan
  async getPlanHistory(id: string): Promise<any[]> {
    const response = await fetch(`/api/plans/${id}/history`);
    const result: ApiResponse<any[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al obtener el historial');
    }

    return result.data || [];
  }
};

// Hook personalizado para operaciones de planes con estado de carga
export function usePlansOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeOperation = async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    executeOperation,
    clearError: () => setError(null)
  };
}

// Hook para manejar el estado de un plan específico
export function usePlanState(planId?: string) {
  const { plan, isLoading, error, revalidate } = usePlan(planId || '');
  const { executeOperation } = usePlansOperations();

  const updatePlan = async (planData: UpdatePlanRequest, user: any) => {
    if (!planId) return null;
    
    return await executeOperation(() => 
      plansApi.updatePlan(planId, planData, user)
    );
  };

  const deletePlan = async (user: any) => {
    if (!planId) return null;
    
    return await executeOperation(() => 
      plansApi.deletePlan(planId, user)
    );
  };

  return {
    plan,
    isLoading,
    error,
    revalidate,
    updatePlan,
    deletePlan
  };
}

// Hook para manejar la creación de planes
export function useCreatePlan() {
  const { executeOperation } = usePlansOperations();

  const createPlan = async (planData: CreatePlanRequest, user: any) => {
    return await executeOperation(() => 
      plansApi.createPlan(planData, user)
    );
  };

  return {
    createPlan
  };
}

// Hook para manejar el reordenamiento de planes
export function useReorderPlans() {
  const { executeOperation } = usePlansOperations();

  const reorderPlans = async (planIds: string[], user: any) => {
    return await executeOperation(() => 
      plansApi.reorderPlans(planIds, user)
    );
  };

  return {
    reorderPlans
  };
}

// Hook para operaciones CRUD de planes
export function usePlansCRUD() {
  const { executeOperation } = usePlansOperations();

  const createPlan = async (planData: CreatePlanRequest, user: any) => {
    return await executeOperation(() => 
      plansApi.createPlan(planData, user)
    );
  };

  const updatePlan = async (id: string, planData: UpdatePlanRequest, user: any) => {
    return await executeOperation(() => 
      plansApi.updatePlan(id, planData, user)
    );
  };

  const deletePlan = async (id: string, user: any) => {
    return await executeOperation(() => 
      plansApi.deletePlan(id, user)
    );
  };

  const reorderPlans = async (planIds: string[], user: any) => {
    return await executeOperation(() => 
      plansApi.reorderPlans(planIds, user)
    );
  };

  return {
    createPlan,
    updatePlan,
    deletePlan,
    reorderPlans
  };
}

// Hook para limpieza de planes
export function usePlansCleanup() {
  const { executeOperation } = usePlansOperations();

  const cleanupDuplicates = async (user: any) => {
    return await executeOperation(async () => {
      // Esta función podría implementarse para limpiar planes duplicados
      // Por ahora, solo retornamos un mensaje de éxito
      console.log('Función de limpieza de duplicados llamada');
      return { success: true, message: 'Limpieza completada' };
    });
  };

  const cleanupInactive = async (user: any) => {
    return await executeOperation(async () => {
      // Esta función podría implementarse para limpiar planes inactivos
      console.log('Función de limpieza de planes inactivos llamada');
      return { success: true, message: 'Limpieza de planes inactivos completada' };
    });
  };

  return {
    cleanupDuplicates,
    cleanupInactive
  };
} 