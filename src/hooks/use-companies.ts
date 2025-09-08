
"use client";

import useSWR from 'swr';
import type { Company } from '@/types';
import type { LandingPlan } from '@/services/landing-plans-service';
import { landingPlansService } from '@/services/landing-plans-service';
import { companyService } from '@/services/company-service';

// Defino un tipo combinado para la respuesta del fetcher
interface CompaniesWithPlans {
  companies: Company[];
  plans: LandingPlan[];
}

// El fetcher ahora obtiene tanto las empresas como los planes
const fetcher = async (): Promise<CompaniesWithPlans> => {
  try {
    const [companies, plans] = await Promise.all([
      companyService.getCompanies(),
      landingPlansService.getPlans(), // Esta función ya no ordenará los datos
    ]);

    return { companies, plans };
  } catch (error) {
    console.error("Error fetching companies and plans:", error);
    // Lanza el error para que SWR lo capture
    throw new Error("No se pudieron obtener los datos de empresas y planes.");
  }
};

export function useCompanies() {
  const { data, error, isLoading, mutate } = useSWR<CompaniesWithPlans>('companies-with-plans', fetcher, {
    revalidateOnFocus: false,
  });

  // Procesamos los datos para añadir el nombre del plan a cada compañía
  const companiesWithPlanNames = data ? data.companies.map(company => {
    // CORRECCIÓN: La búsqueda debe ser flexible, por ID o por slug.
    const plan = data.plans.find(p => p.id === company.planId || p.slug === company.planId);
    
    // Ordenamos los planes aquí en el cliente
    const sortedPlans = [...data.plans].sort((a, b) => (a.order || 0) - (b.order || 0));
    
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
