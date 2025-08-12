
"use client";

import useSWR from 'swr';
import type { Company } from '@/types';
import type { LandingPlan } from '@/services/landing-plans-service';

// Defino un tipo combinado para la respuesta del fetcher
interface CompaniesWithPlans {
  companies: Company[];
  plans: LandingPlan[];
}

// El fetcher ahora obtiene tanto las empresas como los planes
const fetcher = async (): Promise<CompaniesWithPlans> => {
  const [companiesRes, plansRes] = await Promise.all([
    fetch('/api/companies'),
    fetch('/api/plans'), // Usamos la API de planes que ya existe
  ]);

  if (!companiesRes.ok || !plansRes.ok) {
    // Manejo de errores mejorado para dar más contexto
    const companiesError = !companiesRes.ok ? await companiesRes.json().catch(() => ({})) : null;
    const plansError = !plansRes.ok ? await plansRes.json().catch(() => ({})) : null;
    
    const errorMessage = `Error al obtener datos: ${companiesError ? `Empresas (${companiesRes.status})` : ''} ${plansError ? `Planes (${plansRes.status})` : ''}`;
    throw new Error(errorMessage);
  }

  const companiesJson = await companiesRes.json();
  const plansJson = await plansRes.json();

  return {
    companies: companiesJson.data || [],
    plans: plansJson.data || [],
  };
};

export function useCompanies() {
  const { data, error, isLoading, mutate } = useSWR<CompaniesWithPlans>('companies-with-plans', fetcher, {
    revalidateOnFocus: false,
  });

  // Procesamos los datos para añadir el nombre del plan a cada compañía
  const companiesWithPlanNames = data ? data.companies.map(company => {
    const plan = data.plans.find(p => p.id === company.planId);
    return {
      ...company,
      planName: plan ? plan.name : (company.planId || 'No asignado'),
    };
  }) : [];

  return {
    companies: companiesWithPlanNames,
    isLoading,
    error,
    refreshCompanies: mutate,
  };
}
