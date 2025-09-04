
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
  // Ambas llamadas se ejecutan en paralelo para mayor eficiencia
  const [company, allPlans] = await Promise.all([
    companyService.getCompanyById(companyId),
    landingPlansService.getPlans() // Obtiene *todos* los planes disponibles para el admin
  ]);
  return { company, allPlans };
};

export function useSubscription() {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const companyId = currentUser?.companyId;

  // SWR se encarga de llamar al fetcher solo si companyId existe.
  const { data, error, isLoading: isDataLoading } = useSWR(
    companyId ? `subscription/${companyId}` : null,
    () => fetchSubscriptionData(companyId!),
    { revalidateOnFocus: false }
  );

  // Desestructuramos los datos obtenidos. Si no hay datos, usamos valores por defecto.
  const { company = null, allPlans = [] } = data || {};

  // Lógica para encontrar el plan actual de la compañía.
  // Se busca en la lista completa de planes obtenida, asegurando consistencia.
  const currentPlan = company?.planId 
    ? allPlans.find(p => p.id === company.planId || p.slug === company.planId) || null 
    : null;

  // La carga general depende de si la sesión está cargando o si estamos esperando los datos.
  const isLoading = isSessionLoading || (!!companyId && isDataLoading);

  // Calcula los permisos basados en el plan actual.
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
    // Se exporta la lista completa de planes para que la UI pueda mostrar las otras opciones.
    allPlans,
    isLoading,
    error,
  };
}
