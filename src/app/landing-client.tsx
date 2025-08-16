"use client";

import { motion } from 'framer-motion';
import Head from "next/head";
import SubscriptionPlansSection from '@/components/SubscriptionPlansSection';
import type { LandingPlan } from '@/types/plans';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { LandingConfig } from '@/services/landing-config-service';

interface LandingClientProps {
  plans: LandingPlan[];
  config: LandingConfig;
}

export default function LandingClient({ plans, config }: LandingClientProps) {

  return (
    <>
      <Head>
        <title>{config.seo.title}</title>
        <meta name="description" content={config.seo.description} />
        <meta name="keywords" content={config.seo.keywords.join(', ')} />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={config.seo.ogTitle} />
        <meta property="og:description" content={config.seo.ogDescription} />
        <meta property="og:image" content={config.seo.ogImage} />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={config.seo.ogTitle} />
        <meta property="twitter:description" content={config.seo.ogDescription} />
        <meta property="twitter:image" content={config.seo.ogImage} />
      </Head>
      <main className="min-h-screen w-full flex flex-col items-center">
        {/* Hero Section */}
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

        {/* Dynamic Sections from Config */}
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
        
        {/* Subscription Plans Section - Uses the data passed as props */}
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
