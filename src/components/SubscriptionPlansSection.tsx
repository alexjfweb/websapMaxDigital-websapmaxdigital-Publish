"use client";
import React from 'react';
import { useLandingPlans } from '@/hooks/use-landing-plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubscriptionPlansSection() {
  const { plans, isLoading, error } = useLandingPlans();

  return (
    <motion.section
      key="planes"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full max-w-6xl py-16 flex flex-col items-center"
    >
      <h2 className="text-3xl font-bold mb-8">Planes de Suscripción</h2>
      {isLoading ? (
        <div className="text-lg">Cargando planes...</div>
      ) : error ? (
        <div className="text-red-600">Error al cargar los planes</div>
      ) : plans.length === 0 ? (
        <div className="text-gray-600">No hay planes disponibles.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {plans.map((plan, idx) => (
            <Card key={plan.id} className="relative overflow-hidden transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl mr-3`}>
                    ⚡
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${plan.price}
                    <span className="text-lg text-gray-500 font-normal">
                      /{plan.period === 'monthly' ? 'mes' : plan.period === 'yearly' ? 'año' : 'único'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features && plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-left">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200" size="lg">
                  {plan.ctaText || 'Comenzar Prueba Gratuita'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">14 días de prueba gratuita • Sin tarjeta de crédito</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.section>
  );
} 