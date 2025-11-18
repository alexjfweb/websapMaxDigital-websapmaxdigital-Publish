
"use client";

import useSWR from 'swr';
import { useSession } from '@/contexts/session-context';
import type { Company } from '@/types';
import type { LandingPlan } from '@/types/plans';
import { companyService } from '@/services/company-service';
import { landingPlansService } from '@/services/landing-plans-service';

interface SubscriptionInfo {
  company: Company | null;
  plan: LandingPlan | null;
  permissions: {
    canManageEmployees: boolean;
    canUseAdvancedAnalytics: boolean;
    canCustomizeBranding: boolean;
  };
}

// Fetcher optimizado: obtiene la compañía y luego todos los planes (no solo los públicos)
const fetchSubscriptionData = async (companyId: string): Promise<{ company: Company | null, currentPlan: LandingPlan | null, allPlans: LandingPlan[] }> => {
  const company = await companyService.getCompanyById(companyId);
  const allPlans = await landingPlansService.getPlans(); // Obtener todos los planes para una búsqueda robusta

  if (!company || !company.planId) {
    // Si no hay compañía o no tiene planId, no podemos determinar el plan actual.
    return { company, currentPlan: null, allPlans };
  }

  // La lógica para encontrar el plan actual es más robusta ahora.
  // Buscamos el plan que coincida con el planId de la compañía.
  const currentPlan = allPlans.find(p => p.slug === company.planId || p.id === company.planId) || null;
  
  if (company.planId && !currentPlan && (company.subscriptionStatus === 'active' || company.subscriptionStatus === 'pending_payment')) {
      console.warn(`Advertencia: La compañía ${company.id} tiene un planId "${company.planId}" que no corresponde a ningún plan existente.`);
  }

  return { company, currentPlan, allPlans };
};


export function useSubscription() {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const companyId = currentUser?.companyId;

  const { data, error, isLoading: isDataLoading } = useSWR(
    companyId ? `subscription/${companyId}` : null,
    () => fetchSubscriptionData(companyId!),
    { revalidateOnFocus: false }
  );

  const { company = null, currentPlan = null, allPlans = [] } = data || {};
  
  const isLoading = isSessionLoading || (!!companyId && isDataLoading);

  // Filtrar los planes públicos para la sección "Explora"
  const publicPlans = allPlans.filter(p => p.isPublic && p.isActive);

  // LÓGICA DE PERMISOS MEJORADA: Basada en los límites del plan, no en el nombre.
  const permissions = {
    // Se pueden gestionar empleados si el límite `maxUsers` es distinto de cero.
    canManageEmployees: !!currentPlan && currentPlan.maxUsers !== 0,
    
    // La analítica avanzada es para planes con un precio alto (ej, > 30) o ilimitados
    canUseAdvancedAnalytics: !!currentPlan && (currentPlan.price > 30 || currentPlan.maxUsers === -1),

    // La personalización está disponible en cualquier plan de pago.
    canCustomizeBranding: !!currentPlan && currentPlan.price > 0,
  };
  
  return {
    subscription: {
      company: company,
      plan: currentPlan,
      permissions,
    },
    allPlans: publicPlans,
    isLoading,
    error,
  };
}
