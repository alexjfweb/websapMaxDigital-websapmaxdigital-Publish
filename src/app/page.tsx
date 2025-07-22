"use client";
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, ShoppingCart, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Star, 
  Users, 
  Zap,
  DollarSign,
  Calendar,
  Palette
} from 'lucide-react';
import { motion } from 'framer-motion';
import Head from "next/head";
import SubscriptionPlansSection from '@/components/SubscriptionPlansSection';
import { useLandingConfig } from '@/hooks/use-landing-config';
import { landingConfigService } from '@/services/landing-config-service';

// Datos de ejemplo para íconos y colores (debe coincidir con el panel admin)
const PLAN_ICONS = [
  { value: 'zap', label: '⚡ Zap', icon: Zap },
  { value: 'star', label: '⭐ Star', icon: Star },
  { value: 'dollar', label: '💰 Dollar', icon: DollarSign },
  { value: 'users', label: '👥 Users', icon: Users },
  { value: 'calendar', label: '📅 Calendar', icon: Calendar },
  { value: 'palette', label: '🎨 Palette', icon: Palette },
];

const PLAN_COLORS = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'purple', label: 'Púrpura', class: 'bg-purple-500' },
  { value: 'orange', label: 'Naranja', class: 'bg-orange-500' },
  { value: 'red', label: 'Rojo', class: 'bg-red-500' },
  { value: 'indigo', label: 'Índigo', class: 'bg-indigo-500' },
];

// Función para obtener el ícono del plan
const getPlanIcon = (iconValue: string) => {
  const iconData = PLAN_ICONS.find(icon => icon.value === iconValue);
  return iconData ? iconData.icon : Zap;
};

// Función para obtener la clase de color del plan
const getPlanColorClass = (colorValue: string) => {
  const colorData = PLAN_COLORS.find(color => color.value === colorValue);
  return colorData ? colorData.class : 'bg-blue-500';
};

export default function LandingPage() {
  const { config, isLoading, error } = useLandingConfig();

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

  // Si está cargando, mostrar loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-xl">
        Cargando landing...
      </div>
    );
  }

  // Si hay error o no hay configuración, usar configuración por defecto
  if (error || !config) {
    const defaultConfig = {
      title: "WebSapMaxDigital",
      description: "Tu solución digital definitiva para menús de restaurante",
      heroTitle: "Transforma tu restaurante con tecnología inteligente",
      heroSubtitle: "Gestiona pedidos, mesas y clientes de forma eficiente",
      heroButtonText: "¡Comenzar ahora!",
      heroButtonUrl: "#contact",
      heroBackgroundColor: "#ffffff",
      heroTextColor: "#1f2937",
      heroButtonColor: "#3b82f6",
      heroAnimation: "fadeIn" as const,
      sections: [],
      seo: {
        title: "WebSapMaxDigital - Sistema para Restaurantes",
        description: "Sistema inteligente para restaurantes",
        keywords: ["restaurante", "software", "gestión", "digital"]
      }
    };

    return (
      <>
        <Head>
          <title>{defaultConfig.seo.title}</title>
          <meta name="description" content={defaultConfig.seo.description} />
          <meta name="keywords" content={defaultConfig.seo.keywords.join(', ')} />
          <meta property="og:title" content={defaultConfig.seo.title} />
        </Head>
        <main className="min-h-screen w-full bg-gradient-to-b from-white to-blue-50 flex flex-col items-center">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full py-20 flex flex-col items-center"
            style={{ backgroundColor: defaultConfig.heroBackgroundColor }}
          >
            <h1
              className="text-5xl font-extrabold mb-4 text-center"
              style={{ color: defaultConfig.heroTextColor }}
            >
              {defaultConfig.heroTitle}
            </h1>
            <p className="text-xl text-gray-600 mb-8 text-center">{defaultConfig.heroSubtitle}</p>
            <button
              className="px-8 py-3 rounded-full text-white text-lg font-semibold shadow-lg hover:scale-105 transition"
              style={{ background: defaultConfig.heroButtonColor }}
            >
              {defaultConfig.heroButtonText}
            </button>
          </motion.section>

          {/* Sección fija de planes de suscripción */}
          <SubscriptionPlansSection />
        </main>
      </>
    );
  }

  // Ordenar secciones activas
  const activeSections = config.sections
    .filter(section => section.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <Head>
        <title>{config.seo.title}</title>
        <meta name="description" content={config.seo.description} />
        <meta name="keywords" content={config.seo.keywords.join(', ')} />
        <meta property="og:title" content={config.seo.ogTitle || config.seo.title} />
        {config.seo.ogDescription && <meta property="og:description" content={config.seo.ogDescription} />}
        {config.seo.ogImage && <meta property="og:image" content={config.seo.ogImage} />}
      </Head>
      <main className="min-h-screen w-full flex flex-col items-center">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full py-20 flex flex-col items-center"
          style={{ backgroundColor: config.heroBackgroundColor }}
        >
          <h1
            className="text-5xl font-extrabold mb-4 text-center"
            style={{ color: config.heroTextColor }}
          >
            {config.heroTitle}
          </h1>
          <p className="text-xl mb-8 text-center" style={{ color: config.heroTextColor }}>
            {config.heroSubtitle}
          </p>
          <button
            className="px-8 py-3 rounded-full text-white text-lg font-semibold shadow-lg hover:scale-105 transition"
            style={{ background: config.heroButtonColor }}
          >
            {config.heroButtonText}
          </button>
        </motion.section>

        {/* Secciones dinámicas */}
        {activeSections.map((section, index) => (
          <motion.section
            key={section.id}
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

        {/* Sección fija de planes de suscripción */}
        <SubscriptionPlansSection />
      </main>
    </>
  );
}
