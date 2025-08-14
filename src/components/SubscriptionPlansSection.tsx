
"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { LandingPlan } from '@/services/landing-plans-service';
import Link from 'next/link';

// Opciones para íconos y colores (debe coincidir con el panel admin)
const PLAN_ICONS = [
  { value: 'zap', label: '⚡ Zap', icon: Zap },
  { value: 'star', label: '⭐ Star', icon: Star },
  { value: 'dollar', label: '💰 Dollar', icon: DollarSign },
  { value: 'users', label: '👥 Users', icon: Users },
  { value: 'calendar', label: '📅 Calendar', icon: Calendar },
  { value: 'palette', label: '🎨 Palette', icon: Palette },
];

const PLAN_COLORS = [
  { value: 'blue', class: 'bg-blue-500 border-blue-500' },
  { value: 'green', class: 'bg-green-500 border-green-500' },
  { value: 'purple', class: 'bg-purple-500 border-purple-500' },
  { value: 'orange', class: 'bg-orange-500 border-orange-500' },
  { value: 'red', class: 'bg-red-500 border-red-500' },
  { value: 'indigo', class: 'bg-indigo-500 border-indigo-500' },
  { value: 'gray', class: 'bg-gray-500 border-gray-500' },
];

const getPlanIcon = (iconValue: string) => {
  const iconData = PLAN_ICONS.find(icon => icon.value === iconValue);
  return iconData ? iconData.icon : Zap;
};

const getPlanColorClass = (colorValue: string, type: 'bg' | 'border' | 'text') => {
  const colorData = PLAN_COLORS.find(color => color.value === colorValue);
  if (!colorData) return 'bg-blue-500 border-blue-500';
  
  const [bgClass, borderClass] = colorData.class.split(' ');
  
  if (type === 'bg') return bgClass;
  if (type === 'border') return borderClass;
  return `text-${colorValue}-500`; 
};

interface SubscriptionPlansSectionProps {
  plans: LandingPlan[];
}

export default function SubscriptionPlansSection({ plans }: SubscriptionPlansSectionProps) {

  return (
    <motion.section
      key="planes-loaded"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full max-w-6xl py-16 flex flex-col items-center"
    >
      <h2 className="text-3xl font-bold mb-4 text-center">Planes Flexibles para tu Negocio</h2>
      <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl">
        Elige el plan que mejor se adapte a tus necesidades. Todos nuestros planes están diseñados para escalar contigo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {plans.map((plan) => {
          const IconComponent = getPlanIcon(plan.icon);
          const colorClass = getPlanColorClass(plan.color, 'bg');
          const borderColorClass = getPlanColorClass(plan.color, 'border');

          return (
            <Card key={plan.id} data-plan-slug={plan.slug} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col ${plan.isPopular ? 'border-2 ' + borderColorClass : ''}`}>
              {plan.isPopular && <Badge className="absolute top-4 right-4 bg-yellow-400 text-yellow-900">Popular</Badge>}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white text-xl mr-3`}>
                    <IconComponent size={24} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                </div>
                <p className="text-gray-600 text-sm min-h-[40px]">{plan.description}</p>
              </CardHeader>
              <CardContent className="text-center pb-6 flex-grow">
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
              </CardContent>
              <div className="px-6 pb-6 mt-auto">
                <Button 
                  asChild
                  className={`w-full ${colorClass} hover:${colorClass.replace('bg-', 'bg-opacity-90-')} text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200`} 
                  size="lg"
                >
                  <Link href={`/register?plan=${plan.slug}`}>
                    {plan.ctaText || 'Comenzar Prueba Gratuita'}
                  </Link>
                </Button>
                {plan.price > 0 && <p className="text-xs text-gray-500 mt-2 text-center">Impuestos no incluidos</p>}
              </div>
            </Card>
          );
        })}
      </div>
    </motion.section>
  );
}
