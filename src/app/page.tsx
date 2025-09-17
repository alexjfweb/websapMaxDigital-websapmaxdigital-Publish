
"use client"; 

import React, { Suspense, useEffect, useState } from 'react';
import LandingClient from './landing-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandingConfig } from '@/hooks/use-landing-config';
import { AlertTriangle } from 'lucide-react';
import { useLandingPlans } from '@/hooks/use-landing-plans';
import PublicHeader from '@/components/layout/public-header';
import { Button } from '@/components/ui/button';
import { ClientProviders } from '@/contexts/client-providers';

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

function ErrorDisplay({ message, onRetry }: { message: string, onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
            <div className="bg-red-50 rounded-lg shadow-lg p-8 max-w-md w-full border border-red-200">
                <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-red-800 mb-2">Error al Cargar la Página</h1>
                <p className="text-red-700">{message}</p>
                {onRetry && <Button onClick={onRetry} className="mt-4">Reintentar</Button>}
            </div>
        </div>
    );
}

function LandingPageContent() {
  const { landingConfig, isLoading: isLoadingConfig, isError: isErrorConfig, error: errorConfig } = useLandingConfig();
  const { plans, isLoading: isLoadingPlans, error: errorPlans, refetch: retryPlans } = useLandingPlans(true);
  
  const isLoading = isLoadingConfig || isLoadingPlans;

  if (isLoading) {
    return <LandingPageSkeleton />;
  }
  
  if (isErrorConfig || errorConfig) {
    return <ErrorDisplay message={errorConfig?.message || 'Ocurrió un error inesperado al cargar la configuración.'} />
  }
  
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
    <ClientProviders>
      <Suspense fallback={<LandingPageSkeleton />}>
        <LandingPageContent />
      </Suspense>
    </ClientProviders>
  );
}
