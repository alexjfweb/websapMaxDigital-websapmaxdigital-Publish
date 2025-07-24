"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Head from "next/head";
import SubscriptionPlansSection from '@/components/SubscriptionPlansSection';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function LandingPage() {
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
        <ErrorBoundary fallback={<div className="text-red-500 py-10">Error: No se pudieron cargar los planes.</div>}>
          <SubscriptionPlansSection />
        </ErrorBoundary>
      </main>
    </>
  );
}
