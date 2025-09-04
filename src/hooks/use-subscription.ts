
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

// Fetcher unificado para obtener la compañía y todos los planes
const fetchSubscriptionData = async (companyId: string) => {
  const [company, allPlans] = await Promise.all([
    companyService.getCompanyById(companyId),
    landingPlansService.getPlans() // Obtiene todos los planes, para el panel de admin
  ]);
  return { company, allPlans };
};

export function useSubscription() {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const companyId = currentUser?.companyId;

  // SWR hook para obtener todos los datos necesarios con una sola llamada de fetcher
  const { data, error, isLoading: isDataLoading } = useSWR(
    companyId ? `subscription/${companyId}` : null,
    () => fetchSubscriptionData(companyId!),
    { revalidateOnFocus: false }
  );

  const { company, allPlans = [] } = data || {};

  // Busca el plan actual del usuario dentro de la lista completa de planes
  const currentPlan = company?.planId 
    ? allPlans.find(p => p.id === company.planId) || null 
    : null;

  // La carga general depende de la sesión y de la obtención de datos
  const isLoading = isSessionLoading || (!!companyId && isDataLoading);

  const permissions = {
    canManageEmployees: ['estandar', 'premium', 'profesional'].includes(currentPlan?.slug?.split('-')[1] || ''),
    canUseAdvancedAnalytics: ['premium', 'profesional'].includes(currentPlan?.slug?.split('-')[1] || ''),
    canCustomizeBranding: !!currentPlan && currentPlan.price > 0 && currentPlan.slug !== 'plan-gratis-lite',
  };

  return {
    subscription: {
      company: company || null,
      plan: currentPlan,
      permissions,
    },
    // También exportamos allPlans para que la UI pueda usarlo en la lista de "otros planes"
    allPlans,
    isLoading,
    error,
  };
}
