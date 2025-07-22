"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Head from "next/head";
import SubscriptionPlansSection from '@/components/SubscriptionPlansSection';
import { useLandingConfig } from '@/hooks/use-landing-config';
import { landingConfigService } from '@/services/landing-config-service';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';


export default function LandingPage() {
  const { config, isLoading, error } = useLandingConfig();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Este efecto solo se ejecuta en el cliente, después de la hidratación.
    setIsClient(true);
  }, []);


  // Efecto para inicializar configuración por defecto si no existe
  useEffect(() => {
    const initializeDefaultConfig = async () => {
      if (!isLoading && !config && !error) {
        try {
          console.log('Inicializando configuración por defecto...');
          const defaultConfig = landingConfigService.getDefaultConfig();
          await landingConfigService.createLandingConfig(
            defaultConfig,
            'system',
            'system@websapmax.com'
          );
        } catch (err) {
          console.error('Error al inicializar configuración:', err);
        }
      }
    };

    initializeDefaultConfig();
  }, [isLoading, config, error]);

  // Si hay error, mostrar mensaje
  if (error) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error al cargar la configuración</h2>
          <p className="text-gray-600">{error.toString()}</p>
        </div>
      );
  }

  // Usar la configuración cargada o una por defecto si falla la carga
  const displayConfig = config || landingConfigService.getDefaultConfig();
  
  // Ordenar secciones activas
  const activeSections = (displayConfig.sections || [])
    .filter(section => section.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <Head>
        <title>{displayConfig.seo.title}</title>
        <meta name="description" content={displayConfig.seo.description} />
        <meta name="keywords" content={(displayConfig.seo.keywords || []).join(', ')} />
        <meta property="og:title" content={displayConfig.seo.ogTitle || displayConfig.seo.title} />
        {displayConfig.seo.ogDescription && <meta property="og:description" content={displayConfig.seo.ogDescription} />}
        {displayConfig.seo.ogImage && <meta property="og:image" content={displayConfig.seo.ogImage} />}
      </Head>
      <main className="min-h-screen w-full flex flex-col items-center">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full py-20 flex flex-col items-center"
          style={{ backgroundColor: displayConfig.heroBackgroundColor }}
        >
          {isLoading ? (
            <div className="text-center">
              <Skeleton className="h-12 w-96 mx-auto mb-4" />
              <Skeleton className="h-6 w-80 mx-auto mb-8" />
              <Skeleton className="h-12 w-48 mx-auto rounded-full" />
            </div>
          ) : (
            <>
              <h1
                className="text-5xl font-extrabold mb-4 text-center"
                style={{ color: displayConfig.heroTextColor }}
              >
                {displayConfig.heroTitle}
              </h1>
              <p className="text-xl mb-8 text-center" style={{ color: displayConfig.heroTextColor }}>
                {displayConfig.heroSubtitle}
              </p>
              <button
                className="px-8 py-3 rounded-full text-white text-lg font-semibold shadow-lg hover:scale-105 transition"
                style={{ background: displayConfig.heroButtonColor }}
              >
                {displayConfig.heroButtonText}
              </button>
            </>
          )}
        </motion.section>

        {/* Secciones dinámicas */}
        {activeSections.map((section, index) => (
          <motion.section
            key={section.id || index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            className="w-full py-20 flex flex-col items-center"
            style={{ backgroundColor: section.backgroundColor }}
          >
            <div className="max-w-6xl w-full px-4">
              <div className="text-center mb-12">
                <motion.h2 
                  className="text-4xl font-bold mb-6"
                  style={{ color: section.textColor }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {section.title}
                </motion.h2>
                {section.subtitle && (
                  <motion.p 
                    className="text-xl mb-8 text-gray-600"
                    style={{ color: section.textColor }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {section.subtitle}
                  </motion.p>
                )}
                <motion.div
                  className="max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <p 
                    className="text-lg leading-relaxed mb-10"
                    style={{ color: section.textColor }}
                  >
                    {section.content}
                  </p>
                  {section.buttonText && (
                    <motion.button
                      className="px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:scale-105 transition-all duration-300"
                      style={{ 
                        backgroundColor: section.buttonColor, 
                        color: '#ffffff' 
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {section.buttonText}
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.section>
        ))}

        {/* Renderizado seguro del lado del cliente para la sección de planes */}
        <ErrorBoundary fallback={<div className="text-red-500 py-10">Error: No se pudieron cargar los planes.</div>}>
          {isClient && <SubscriptionPlansSection />}
        </ErrorBoundary>
      </main>
    </>
  );
}
