
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

const fetchSubscriptionData = async (companyId: string) => {
  const [company, allPlans] = await Promise.all([
    companyService.getCompanyById(companyId),
    landingPlansService.getPlans()
  ]);
  return { company, allPlans };
};

export function useSubscription() {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const companyId = currentUser?.companyId;

  const { data, error, isLoading: isDataLoading } = useSWR(
    companyId ? `subscription/${companyId}` : null,
    () => fetchSubscriptionData(companyId!),
    { revalidateOnFocus: false }
  );

  const { company = null, allPlans = [] } = data || {};

  // CORRECCIÓN: Lógica de búsqueda de plan más robusta.
  const currentPlan = company?.planId
    ? allPlans.find(p => p.id === company.planId || p.slug === company.planId) || null
    : null;

  const isLoading = isSessionLoading || (!!companyId && isDataLoading);

  const permissions = {
    canManageEmployees: ['estandar', 'premium', 'profesional'].includes(currentPlan?.slug?.split('-')[1] || ''),
    canUseAdvancedAnalytics: ['premium', 'profesional'].includes(currentPlan?.slug?.split('-')[1] || ''),
    canCustomizeBranding: !!currentPlan && currentPlan.price > 0 && currentPlan.slug !== 'plan-gratis-lite',
  };
  
  const publicPlans = allPlans.filter(p => p.isPublic);

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
