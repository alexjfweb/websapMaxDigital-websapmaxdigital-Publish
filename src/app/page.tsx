
"use client"; 

import React from 'react';
import LandingClient from './landing-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandingConfig } from '@/hooks/use-landing-config';
import { AlertTriangle } from 'lucide-react';
import { useLandingPlans } from '@/hooks/use-landing-plans';
import PublicHeader from '@/components/layout/public-header';
import { Button } from '@/components/ui/button';

function LandingPageSkeleton() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center">
      <section className="w-full py-20 flex flex-col items-center">
        <Skeleton className="h-12 w-2/3 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-12 w-40 rounded-full" />
      </section>
      <section className="w-full py-16 container mx-auto">
        <Skeleton className="h-8 w-1/3 mx-auto mb-4" />
        <Skeleton className="h-5 w-2/3 mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </section>
    </main>
  );
}

function LandingPageContent() {
  // Ahora los hooks son más resilientes y siempre devuelven un valor.
  const { landingConfig, isLoading: isLoadingConfig, error: errorConfig, refetch: retryConfig } = useLandingConfig();
  const { plans, isLoading: isLoadingPlans, error: errorPlans, refetch: retryPlans } = useLandingPlans(true);
  
  const isLoading = isLoadingConfig || isLoadingPlans;

  // Mostramos el esqueleto solo si la configuración principal está cargando.
  if (isLoadingConfig) {
    return <LandingPageSkeleton />;
  }
  
  // El `landingConfig` siempre tendrá un valor (el de la DB o el por defecto).
  // El error en `errorPlans` se manejará dentro de LandingClient.
  return (
    <>
        <PublicHeader />
        <LandingClient 
            initialConfig={landingConfig} 
            plans={plans}
            errorPlans={errorPlans}
            retryPlans={retryPlans}
        />
    </>
  );
}


export default function Page() {
  return (
    <LandingPageContent />
  );
}
