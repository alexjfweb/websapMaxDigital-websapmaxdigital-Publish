
"use client";

import { motion } from 'framer-motion';
import Head from "next/head";
import SubscriptionPlansSection from '@/components/SubscriptionPlansSection';
import type { LandingPlan } from '@/types/plans';
import { AlertTriangle, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { LandingConfig } from '@/services/landing-config-service';
import { usePublicLandingConfig } from '@/hooks/use-landing-config';
import { useLandingPlans } from '@/hooks/use-landing-plans';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

function LandingSkeleton() {
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

function ErrorDisplay({ 
  title, 
  message, 
  details, 
  onRetry, 
  isOnline 
}: {
  title: string;
  message: string;
  details?: string;
  onRetry: () => void;
  isOnline: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
      >
        <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-4">{message}</p>

        <div className="flex items-center justify-center mb-4 p-2 rounded-lg bg-gray-50">
          {isOnline ? (
            <div className="flex items-center text-green-600">
              <Wifi className="h-4 w-4 mr-2" />
              <span className="text-sm">Conectado</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <WifiOff className="h-4 w-4 mr-2" />
              <span className="text-sm">Sin conexión</span>
            </div>
          )}
        </div>

        {details && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-left">
            <p className="text-sm text-red-800">
              <strong>Detalle:</strong> {details}
            </p>
          </div>
        )}

        <Button 
          onClick={onRetry}
          className="w-full bg-red-600 hover:bg-red-700 text-white mb-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>

        <div className="text-xs text-gray-500 text-left">
          <p className="font-semibold mb-1">Posibles soluciones:</p>
          <ul className="space-y-1">
            <li>• Verifica tu conexión a internet</li>
            <li>• Recarga la página completa (Ctrl+F5)</li>
            <li>• Limpia el cache del navegador</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default function LandingClient() {
  const [isOnline, setIsOnline] = useState(true);

  const { 
    config, 
    isLoading: isLoadingConfig,
    error: errorConfig,
  } = usePublicLandingConfig();

  const { 
    plans, 
    isLoading: isLoadingPlans, 
    error: errorPlans, 
    refetch: retryPlans 
  } = useLandingPlans(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }
  }, []);

  const isLoading = isLoadingPlans || isLoadingConfig;

  if (isLoading) {
    return <LandingSkeleton />;
  }

  return (
    <>
      <Head>
        <title>{config.seo.title}</title>
        <meta name="description" content={config.seo.description} />
        <meta name="keywords" content={config.seo.keywords.join(', ')} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={config.seo.ogTitle} />
        <meta property="og:description" content={config.seo.ogDescription} />
        <meta property="og:image" content={config.seo.ogImage} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={config.seo.ogTitle} />
        <meta property="twitter:description" content={config.seo.ogDescription} />
        <meta property="twitter:image" content={config.seo.ogImage} />
      </Head>

      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm z-50">
          <WifiOff className="inline h-4 w-4 mr-2" />
          Sin conexión - Mostrando última versión cargada
        </div>
      )}

      {errorPlans && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm">Los planes no se pudieron cargar</span>
            <button 
              onClick={retryPlans}
              className="ml-2 text-yellow-600 hover:text-yellow-800"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <main className="min-h-screen w-full flex flex-col items-center">
        <motion.section
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full py-20 flex flex-col items-center"
          style={{ backgroundColor: config.heroBackgroundColor, color: config.heroTextColor }}
        >
          <h1
            className="text-5xl font-extrabold mb-4 text-center"
            style={{ color: config.heroTextColor }}
          >
            {config.heroTitle}
          </h1>
          <p className="text-xl mb-8 text-center">
            {config.heroSubtitle}
          </p>
          <Button
            asChild
            className="text-lg font-semibold shadow-lg hover:scale-105 transition py-3 px-8 rounded-full"
            style={{ backgroundColor: config.heroButtonColor, color: '#ffffff' }}
          >
            <a href={config.heroButtonUrl}>{config.heroButtonText}</a>
          </Button>
        </motion.section>

        {config.sections.filter(s => s.isActive).map(section => (
          <motion.section
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full py-16"
            style={{ backgroundColor: section.backgroundColor, color: section.textColor }}
          >
            <div className="container mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">{section.subtitle}</p>
              
              {section.subsections && section.subsections.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                  {section.subsections.map(sub => (
                    <Card key={sub.id} className="text-left bg-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105">
                      {sub.imageUrl && (
                        <CardHeader className="p-0">
                          <Image src={sub.imageUrl} alt={sub.title} className="w-full h-40 object-cover rounded-t-lg" width={400} height={200} data-ai-hint="feature icon"/>
                        </CardHeader>
                      )}
                      <CardContent className="p-6">
                        <CardTitle className="text-xl mb-2 text-gray-800">{sub.title}</CardTitle>
                        <p className="text-gray-600">{sub.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        ))}
        
        <div id="planes">
          {plans && plans.length > 0 ? (
            <SubscriptionPlansSection plans={plans} />
          ) : (
            <motion.section
              key="planes-empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl py-16 flex justify-center"
            >
              <div className="col-span-full text-gray-600 text-center bg-gray-50 p-8 rounded-lg shadow-sm border">
                <AlertTriangle className="h-10 w-10 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold">
                  {errorPlans ? 'Error al cargar planes' : 'No hay planes disponibles'}
                </h3>
                <p>
                  {errorPlans 
                    ? 'Ocurrió un problema al cargar los planes de suscripción.' 
                    : 'Actualmente no hay planes de suscripción para mostrar. Por favor, vuelve más tarde.'
                  }
                </p>
                {errorPlans && (
                  <Button 
                    onClick={retryPlans} 
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar cargar planes
                  </Button>
                )}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs max-w-xs z-50">
          <div>Config: {config && !errorConfig ? '✅' : '❌'}</div>
          <div>Plans: {plans ? `✅ ${plans.length}` : errorPlans ? '❌' : '⏳'}</div>
          <div>Online: {isOnline ? '🟢' : '🔴'}</div>
        </div>
      )}
    </>
  );
}
