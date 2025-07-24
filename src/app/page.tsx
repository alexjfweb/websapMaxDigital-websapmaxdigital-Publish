"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Head from "next/head";
import SubscriptionPlansSection from '@/components/SubscriptionPlansSection';
import ErrorBoundary from '@/components/ErrorBoundary';
import { usePublicLandingPlans } from '@/hooks/use-plans';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card'; 

const PlanSkeleton = () => (
  <motion.section
    key="planes-skeleton"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="w-full max-w-6xl py-16 flex flex-col items-center"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {Array(3).fill(0).map((_, idx) => (
        <Card key={`skeleton-${idx}`} className="relative overflow-hidden transition-all duration-300 flex flex-col">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <Skeleton className="w-12 h-12 rounded-full mr-3" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="text-center pb-6 flex-grow">
            <div className="mb-6">
              <Skeleton className="h-10 w-24 mx-auto mb-2" />
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-left">
                <Skeleton className="h-5 w-5 rounded-full mr-3" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex items-center text-left">
                <Skeleton className="h-5 w-5 rounded-full mr-3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div className="flex items-center text-left">
                <Skeleton className="h-5 w-5 rounded-full mr-3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardContent>
          <div className="px-6 pb-6 mt-auto">
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  </motion.section>
);

const ErrorDisplay = ({ error }: { error: Error | null }) => (
  <motion.section
    key="planes-error"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full max-w-6xl py-16 flex justify-center"
  >
    <div className="col-span-full text-red-600 text-center bg-red-50 p-8 rounded-lg shadow-md border border-red-200 flex flex-col items-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No se pudieron cargar los planes</h3>
      <p className="text-sm">Por favor, intenta de nuevo más tarde.</p>
      <p className="text-xs mt-4 text-red-400">Detalle: {error?.message || 'Error desconocido'}</p>
    </div>
  </motion.section>
);


export default function LandingPage() {
  const { plans, isLoading, isError, error } = usePublicLandingPlans();

  // Componente para renderizar la sección de planes
  const renderPlansSection = () => {
    if (isLoading) {
      return <PlanSkeleton />;
    }
    if (isError) {
      return <ErrorDisplay error={error} />;
    }
    // Asegurarse de no mostrar la sección si no hay planes, incluso después de cargar
    if (!isLoading && plans.length === 0) {
        return (
          <motion.section
            key="planes-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl py-16 flex justify-center"
          >
            <div className="col-span-full text-gray-600 text-center bg-gray-50 p-8 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold">No hay planes disponibles</h3>
              <p>Actualmente no hay planes de suscripción para mostrar. Por favor, vuelve más tarde.</p>
            </div>
          </motion.section>
        );
    }
    return <SubscriptionPlansSection plans={plans} />;
  };

  return (
    <>
      <Head>
        <title>WebSapMaxDigital - Bienvenido</title>
        <meta name="description" content="Tu solución digital definitiva para menús de restaurante" />
      </Head>
      <main className="min-h-screen w-full flex flex-col items-center">
        {/* Hero Section Simplificado */}
        <motion.section
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full py-20 flex flex-col items-center bg-background"
        >
            <h1
              className="text-5xl font-extrabold mb-4 text-center text-primary"
            >
              Bienvenido a WebSapMax Digital
            </h1>
            <p className="text-xl mb-8 text-center text-foreground">
              La solución todo en uno para tu restaurante.
            </p>
            <button
              className="px-8 py-3 rounded-full text-white text-lg font-semibold shadow-lg hover:scale-105 transition bg-primary"
            >
              Comenzar
            </button>
        </motion.section>

        {/* Renderizado seguro del lado del cliente para la sección de planes */}
        <ErrorBoundary fallback={<ErrorDisplay error={new Error('Error en el componente de planes')} />}>
          {renderPlansSection()}
        </ErrorBoundary>
      </main>
    </>
  );
}
