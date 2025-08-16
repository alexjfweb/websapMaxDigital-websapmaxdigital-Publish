"use client";

import { motion } from 'framer-motion';
import Head from "next/head";
import SubscriptionPlansSection from '@/components/SubscriptionPlansSection';
import type { LandingPlan } from '@/types/plans';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface LandingClientProps {
  plans: LandingPlan[];
}

// Static configuration for the landing page
const staticConfig = {
  heroTitle: "Transforma tu Restaurante con un Menú Digital",
  heroSubtitle: "Atrae más clientes, optimiza pedidos y mejora la experiencia.",
  heroButtonText: "Ver Planes",
  heroButtonUrl: "#planes",
  heroBackgroundColor: "#FFF2E6",
  heroTextColor: "#1f2937",
  heroButtonColor: "#FF4500",
  sections: [
     {
      id: 'section-1',
      type: 'features',
      title: 'Características Principales',
      subtitle: 'Todo lo que necesitas para llevar tu restaurante al siguiente nivel.',
      content: 'Nuestra plataforma es fácil de usar, personalizable y está diseñada para crecer contigo.',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonColor: '#FF4500',
      buttonText: 'Explorar Funciones',
      buttonUrl: '#',
      subsections: [
        { id: 'sub-1-1', title: 'Menú con QR', content: 'Acceso instantáneo para tus clientes.', imageUrl: 'https://placehold.co/300x200.png?text=QR' },
        { id: 'sub-1-2', title: 'Gestión de Pedidos', content: 'Optimiza tu cocina y servicio.', imageUrl: 'https://placehold.co/300x200.png?text=Pedidos' },
        { id: 'sub-1-3', title: 'Reservas Online', content: 'Asegura mesas llenas.', imageUrl: 'https://placehold.co/300x200.png?text=Reservas' },
      ]
    },
  ]
};


export default function LandingClient({ plans }: LandingClientProps) {

  return (
    <>
      <Head>
        <title>WebSapMaxDigital - Bienvenido</title>
        <meta name="description" content="Tu solución digital definitiva para menús de restaurante" />
      </Head>
      <main className="min-h-screen w-full flex flex-col items-center">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full py-20 flex flex-col items-center"
          style={{ backgroundColor: staticConfig.heroBackgroundColor, color: staticConfig.heroTextColor }}
        >
          <h1
            className="text-5xl font-extrabold mb-4 text-center"
            style={{ color: staticConfig.heroTextColor }}
          >
            {staticConfig.heroTitle}
          </h1>
          <p className="text-xl mb-8 text-center">
            {staticConfig.heroSubtitle}
          </p>
          <Button
            asChild
            className="text-lg font-semibold shadow-lg hover:scale-105 transition py-3 px-8 rounded-full"
            style={{ backgroundColor: staticConfig.heroButtonColor, color: '#ffffff' }}
          >
            <a href={staticConfig.heroButtonUrl}>{staticConfig.heroButtonText}</a>
          </Button>
        </motion.section>

        {/* Dynamic Sections from Static Config */}
        {staticConfig.sections.map(section => (
          <motion.section
            key={section.id}
            id="features" // Add an ID for navigation
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
                          <Image src={sub.imageUrl} alt={sub.title} className="w-full h-40 object-cover rounded-t-lg" width={400} height={200} />
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
        
        {/* Subscription Plans Section */}
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
                    <h3 className="text-xl font-semibold">No hay planes disponibles</h3>
                    <p>Actualmente no hay planes de suscripción para mostrar. Por favor, vuelve más tarde.</p>
                  </div>
                </motion.section>
          )}
        </div>
      </main>
    </>
  );
}
