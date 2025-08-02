
"use client";

import useSWR from 'swr';
import { useSession } from '@/contexts/session-context';
import type { Company } from '@/types';
import type { LandingPlan } from '@/services/landing-plans-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SubscriptionInfo {
  company: Company | null;
  plan: LandingPlan | null;
  permissions: {
    canManageEmployees: boolean;
    canUseAdvancedAnalytics: boolean;
    canCustomizeBranding: boolean;
  };
}

const fetchCompany = async (companyId: string): Promise<Company | null> => {
  const docRef = doc(db, 'companies', companyId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Company : null;
};

const fetchPlan = async (planId: string): Promise<LandingPlan | null> => {
    const docRef = doc(db, 'landingPlans', planId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
    } as LandingPlan;
};

export function useSubscription() {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const companyId = currentUser?.companyId;

  const { data: company, error: companyError } = useSWR<Company | null>(
    companyId ? `company/${companyId}` : null,
    () => fetchCompany(companyId!)
  );

  const planId = company?.planId;

  const { data: plan, error: planError } = useSWR<LandingPlan | null>(
    planId ? `plan/${planId}` : null,
    () => fetchPlan(planId!)
  );

  const isLoading = isSessionLoading || (companyId && !company && !companyError) || (planId && !plan && !planError);

  const permissions = {
    // La gestión de empleados está disponible en planes 'estándar', 'premium' y 'profesional'.
    canManageEmployees: ['plan-estandar', 'plan-premium', 'plan-profesional'].includes(plan?.slug || ''),
    // Ejemplo: Analíticas avanzadas solo para premium y superior.
    canUseAdvancedAnalytics: ['plan-premium', 'plan-profesional'].includes(plan?.slug || ''),
    // Ejemplo: Personalización de marca solo para planes de pago.
    canCustomizeBranding: !!plan && plan.price > 0,
  };

  return {
    subscription: {
      company,
      plan,
      permissions,
    },
    isLoading,
    error: companyError || planError,
  };
}
