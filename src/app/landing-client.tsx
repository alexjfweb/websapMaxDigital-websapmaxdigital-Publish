

"use client";

import { motion } from 'framer-motion';
import Head from "next/head";
import SubscriptionPlansSection from '@/components/SubscriptionPlansSection';
import type { LandingPlan } from '@/types/plans';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { LandingConfig } from '@/services/landing-config-service';

interface LandingClientProps {
  initialConfig: LandingConfig;
  plans: LandingPlan[];
  errorPlans: string | null;
  retryPlans: () => void;
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


export default function LandingClient({ initialConfig: config, plans, errorPlans, retryPlans }: LandingClientProps) {
  
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
          {config.heroContent && (
            <div 
              className="text-lg max-w-3xl text-center mb-8 ql-editor"
              dangerouslySetInnerHTML={{ __html: config.heroContent }}
            />
          )}
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
            className="w-full py-16 px-4"
            style={{ backgroundColor: section.backgroundColor, color: section.textColor }}
          >
            <div className="container mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">{section.subtitle}</p>
              
              {section.content && (
                  <div className="text-base text-muted-foreground mb-8 max-w-3xl mx-auto ql-editor" dangerouslySetInnerHTML={{ __html: section.content }} />
              )}
              
              {section.buttonText && section.buttonUrl && (
                  <Button asChild size="lg" style={{ backgroundColor: section.buttonColor, color: section.textColor }}>
                    <a href={section.buttonUrl}>{section.buttonText}</a>
                  </Button>
              )}

              {section.type !== 'testimonials' && section.subsections && section.subsections.length > 0 && (
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
                        <div className="text-gray-600 ql-editor" dangerouslySetInnerHTML={{ __html: sub.content }} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {section.type === 'testimonials' && section.subsections && section.subsections.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  {section.subsections.map(sub => (
                      <Card key={sub.id} className="bg-white/80 backdrop-blur-sm text-gray-800">
                          <CardContent className="p-6 text-center">
                              <Image src={sub.imageUrl || 'https://placehold.co/100x100.png'} alt={sub.title} width={80} height={80} className="mx-auto mb-4 rounded-full border-4 border-white shadow-lg" />
                              <div className="text-lg italic mb-4 ql-editor" dangerouslySetInnerHTML={{ __html: sub.content }}/>
                              <p className="font-bold text-primary">{sub.title}</p>
                              {sub.authorRole && <p className="text-sm text-muted-foreground">{sub.authorRole}</p>}
                          </CardContent>
                      </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        ))}
        
        <div id="planes">
          {errorPlans ? (
             <ErrorDisplay title="Error al Cargar Planes" message={errorPlans} onRetry={retryPlans} />
          ) : (
            <SubscriptionPlansSection plans={plans} />
          )}
        </div>
      </main>
    </>
  );
}
