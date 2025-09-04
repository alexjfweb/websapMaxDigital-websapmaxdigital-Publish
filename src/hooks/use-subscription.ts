
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
const fetchSubscriptionData = async (companyId: string) => {
  const company = await companyService.getCompanyById(companyId);
  if (!company) {
    // Si no hay compañía, no podemos obtener el plan.
    // Devolvemos todos los planes para la sección "Explora"
    return { company: null, currentPlan: null, allPlans: await landingPlansService.getPlans() };
  }

  // Ahora, obtenemos todos los planes para poder encontrar el plan actual por slug
  const allPlans = await landingPlansService.getPlans();
  
  // La lógica para encontrar el plan actual es más robusta ahora
  const currentPlan = allPlans.find(p => p.slug === company.planId) || null;

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
  const publicPlans = allPlans.filter(p => p.isPublic);

  const permissions = {
    canManageEmployees: ['estandar', 'premium', 'profesional'].includes(currentPlan?.slug?.split('-')[1] || ''),
    canUseAdvancedAnalytics: ['premium', 'profesional'].includes(currentPlan?.slug?.split('-')[1] || ''),
    canCustomizeBranding: !!currentPlan && currentPlan.price > 0 && currentPlan.slug !== 'plan-gratis-lite',
  };
  
  return {
    subscription: {
      company: company,
      plan: currentPlan,
      permissions,
    },
    allPlans: publicPlans, // Devolver solo los públicos para la UI de exploración
    isLoading,
    error,
  };
}
