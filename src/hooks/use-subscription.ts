
"use client";

import useSWR from 'swr';
import { useSession } from '@/contexts/session-context';
import type { Company } from '@/types';
import type { LandingPlan } from '@/services/landing-plans-service';
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
  
  if (company.planId && !currentPlan) {
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

  // CORRECCIÓN: Convertir el slug a minúsculas antes de la comprobación
  const planSlugPart = currentPlan?.slug?.toLowerCase().split('-')[1] || '';

  const permissions = {
    // CORRECIÓN: Se incluye 'basico' en la lista de planes con permiso para gestionar empleados.
    canManageEmployees: ['basico', 'estandar', 'premium', 'profesional'].includes(planSlugPart),
    canUseAdvancedAnalytics: ['premium', 'profesional'].includes(planSlugPart),
    canCustomizeBranding: !!currentPlan && currentPlan.price > 0 && currentPlan.slug !== 'plan-gratis-lite',
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
