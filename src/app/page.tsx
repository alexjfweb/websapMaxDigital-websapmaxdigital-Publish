"use client"; // Convertir a Componente de Cliente

import React, { Suspense } from 'react';
import LandingClient from './landing-client';
import { Skeleton } from '@/components/ui/skeleton';
import { landingConfigService, LandingConfig } from '@/services/landing-config-service';
import { useLandingConfig } from '@/hooks/use-landing-config'; // Importar el hook de cliente

// Componente de carga para la página de inicio
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

// Page ahora es un Componente de Cliente que usa el hook
export default function Page() {
  // Usamos el hook para obtener los datos de forma segura en el cliente
  const { landingConfig, isLoading, isError } = useLandingConfig();

  if (isLoading || isError) {
    // Si está cargando o hay un error, mostramos el esqueleto.
    // El hook maneja los errores internamente.
    return <LandingPageSkeleton />;
  }
  
  return (
    <Suspense fallback={<LandingPageSkeleton />}>
      {/* Pasamos los datos al componente cliente como props */}
      <LandingClient initialConfig={landingConfig} />
    </Suspense>
  );
}
