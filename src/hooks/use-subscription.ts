
"use client";

import useSWR from 'swr';
import { useSession } from '@/contexts/session-context';
import type { Company } from '@/types';
import type { LandingPlan } from '@/services/landing-plans-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

export function useSubscription() {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const companyId = currentUser?.companyId;

  // SWR hook to fetch company data, already serialized by the service
  const { data: company, error: companyError, isLoading: isCompanyLoading } = useSWR<Company | null>(
    companyId ? `company/${companyId}` : null,
    () => companyService.getCompanyById(companyId!)
  );

  const planId = company?.planId;

  // SWR hook to fetch plan data, already serialized by the service
  const { data: plan, error: planError, isLoading: isPlanLoading } = useSWR<LandingPlan | null>(
    planId ? `plan/${planId}` : null,
    () => landingPlansService.getPlanById(planId!)
  );

  // La carga general depende de la sesión y de las cargas de datos condicionales.
  const isLoading = isSessionLoading || (companyId && isCompanyLoading) || (planId && isPlanLoading);

  const permissions = {
    // La gestión de empleados está disponible en planes 'estándar', 'premium' y 'profesional'.
    canManageEmployees: ['estandar', 'premium', 'profesional'].includes(plan?.slug?.split('-')[1] || ''),
    // Ejemplo: Analíticas avanzadas solo para premium y superior.
    canUseAdvancedAnalytics: ['premium', 'profesional'].includes(plan?.slug?.split('-')[1] || ''),
    // La personalización de marca está disponible en cualquier plan con un precio > 0.
    canCustomizeBranding: !!plan && plan.price > 0 && plan.slug !== 'plan-gratis-lite',
  };

  return {
    subscription: {
      company: company || null,
      plan: plan || null,
      permissions,
    },
    isLoading,
    error: companyError || planError,
  };
}
