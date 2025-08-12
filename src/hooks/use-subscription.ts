
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
    // Corregido: Busca directamente por ID de documento
    const docRef = doc(db, 'landingPlans', planId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        // Asegurarse de que los Timestamps se conviertan a Date si existen
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    } as LandingPlan;
};

export function useSubscription() {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const companyId = currentUser?.companyId;

  const { data: company, error: companyError, isLoading: isCompanyLoading } = useSWR<Company | null>(
    companyId ? `company/${companyId}` : null,
    () => fetchCompany(companyId!)
  );

  const planId = company?.planId;

  const { data: plan, error: planError, isLoading: isPlanLoading } = useSWR<LandingPlan | null>(
    planId ? `plan/${planId}` : null,
    () => fetchPlan(planId!)
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
