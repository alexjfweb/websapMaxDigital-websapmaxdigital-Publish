
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

// Fetcher optimizado: obtiene la compañía y luego el plan específico y todos los planes públicos.
const fetchSubscriptionData = async (companyId: string) => {
  const company = await companyService.getCompanyById(companyId);
  if (!company) {
    // Si no hay compañía, no podemos obtener el plan.
    return { company: null, currentPlan: null, allPublicPlans: await landingPlansService.getPublicPlans() };
  }

  // Ahora, obtenemos tanto el plan específico del usuario como todos los planes públicos.
  const [currentPlan, allPublicPlans] = await Promise.all([
    company.planId ? landingPlansService.getPlanBySlug(company.planId) : Promise.resolve(null),
    landingPlansService.getPublicPlans()
  ]);

  return { company, currentPlan, allPublicPlans };
};


export function useSubscription() {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const companyId = currentUser?.companyId;

  const { data, error, isLoading: isDataLoading } = useSWR(
    companyId ? `subscription/${companyId}` : null,
    () => fetchSubscriptionData(companyId!),
    { revalidateOnFocus: false }
  );

  const { company = null, currentPlan = null, allPublicPlans = [] } = data || {};
  
  const isLoading = isSessionLoading || (!!companyId && isDataLoading);

  const permissions = {
    canManageEmployees: ['estandar', 'premium', 'profesional'].includes(currentPlan?.slug?.split('-')[1] || ''),
    canUseAdvancedAnalytics: ['premium', 'profesional'].includes(currentPlan?.slug?.split('-')[1] || ''),
    canCustomizeBranding: !!currentPlan && currentPlan.price > 0 && currentPlan.slug !== 'plan-gratis-lite',
  };
  
  return {
    subscription: {
      company: company,
      plan: currentPlan, // Usa directamente el plan ya filtrado y obtenido.
      permissions,
    },
    allPlans: allPublicPlans, // Usa la lista de planes públicos para la sección "Explora".
    isLoading,
    error,
  };
}
