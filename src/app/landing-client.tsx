
"use client";

import { motion } from 'framer-motion';
import Head from "next/head";
import SubscriptionPlansSection from '@/components/SubscriptionPlansSection';
import type { LandingPlan } from '@/types/plans';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { LandingConfig } from '@/services/landing-config-service';
import { usePublicLandingConfig } from '@/hooks/use-landing-config';
import { useLandingPlans } from '@/hooks/use-landing-plans';
import { Skeleton } from '@/components/ui/skeleton';

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

function ErrorDisplay({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void; }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-red-50 rounded-lg shadow-lg p-8 max-w-md w-full border border-red-200"
      >
        <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-800 mb-2">{title}</h1>
        <p className="text-red-700 mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} className="w-full bg-red-600 hover:bg-red-700 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
      </motion.div>
    </div>
  );
}


export default function LandingClient() {
  const { 
    config, 
    isLoading: isLoadingConfig,
    error: errorConfig,
    refetch: retryConfig
  } = usePublicLandingConfig();

  const { 
    plans, 
    isLoading: isLoadingPlans, 
    error: errorPlans, 
    refetch: retryPlans 
  } = useLandingPlans(true);

  // ✅ CORRECCIÓN: Si la configuración principal o la de SEO no está lista, muestra el esqueleto.
  // Esto previene el error "cannot read properties of undefined".
  if (isLoadingConfig || !config || !config.seo) {
    return <LandingSkeleton />;
  }
  
  if (errorConfig) {
      return <ErrorDisplay title="Error al Cargar la Página" message={errorConfig} onRetry={retryConfig} />;
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

      <main className="min-h-screen w-full flex flex-col items-center">
        <motion.section
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full py-20 flex flex-col items-center"
          style={{ backgroundColor: config.heroBackgroundColor, color: config.heroTextColor }}
        >
          <h1
            className="text-5xl font-extrabold mb-4 text-center max-w-4xl"
            style={{ color: config.heroTextColor }}
          >
            {config.heroTitle}
          </h1>
          <p className="text-xl mb-8 text-center max-w-3xl">
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

        {config.sections && Array.isArray(config.sections) && config.sections.filter(s => s.isActive).map(section => (
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
                      <CardHeader className="p-0">
                          <div className="relative aspect-[4/3] w-full">
                              <Image 
                                  src={sub.imageUrl || "https://placehold.co/400x300.png"} 
                                  alt={sub.title || 'Característica'} 
                                  fill
                                  className="object-cover rounded-t-lg"
                                  loading="lazy"
                                  data-ai-hint="feature icon"
                              />
                          </div>
                      </CardHeader>
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
          {isLoadingPlans ? (
            <LandingSkeleton />
          ) : errorPlans ? (
             <ErrorDisplay title="Error al Cargar Planes" message={errorPlans} onRetry={retryPlans} />
          ) : (
            <SubscriptionPlansSection plans={plans} />
          )}
        </div>
      </main>
    </>
  );
}
