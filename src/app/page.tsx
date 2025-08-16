
// src/app/page.tsx (Server Component)
import 'server-only';
import React from 'react';
import LandingClient from './landing-client';

// --- Imports para acceso a datos con privilegios de administrador ---
import { adminDb } from '@/lib/firebase-admin';
import type { Timestamp } from 'firebase-admin/firestore';

// --- Tipos de datos importados para mantener la consistencia ---
import type { LandingPlan } from '@/types/plans';
import type { LandingConfig } from '@/services/landing-config-service';

// --- Funciones de ayuda movidas aquí para ser usadas en el servidor ---

const serializeDate = (date: any): string | null => {
  if (!date) return null;
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') {
    const d = new Date(date);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  if (date && typeof date.seconds === 'number') {
    return new Date(date.seconds * 1000).toISOString();
  }
  return null;
};

const serializePlan = (id: string, data: any): LandingPlan => ({
  id,
  slug: data.slug || '',
  name: data.name || '',
  description: data.description || '',
  price: data.price ?? 0,
  currency: data.currency || 'USD',
  period: data.period || 'monthly',
  features: data.features || [],
  isActive: data.isActive ?? false,
  isPublic: data.isPublic ?? false,
  isPopular: data.isPopular ?? false,
  order: data.order ?? 99,
  icon: data.icon || 'zap',
  color: data.color || 'blue',
  maxUsers: data.maxUsers,
  maxProjects: data.maxProjects,
  ctaText: data.ctaText,
  createdAt: serializeDate(data.createdAt)!,
  updatedAt: serializeDate(data.updatedAt)!,
  createdBy: data.createdBy || 'system',
  updatedBy: data.updatedBy || 'system',
  mp_preapproval_plan_id: data.mp_preapproval_plan_id,
});

const getLandingDefaultConfigForServer = (): LandingConfig => ({
    id: 'main',
    heroTitle: 'Transforma tu Restaurante con un Menú Digital',
    heroSubtitle: 'Atrae más clientes, optimiza pedidos y mejora la experiencia.',
    heroButtonText: 'Ver Planes',
    heroButtonUrl: '#planes',
    heroBackgroundColor: '#FFF2E6',
    heroTextColor: '#1f2937',
    heroButtonColor: '#FF4500',
    heroAnimation: 'fadeIn',
    sections: [],
    seo: {
        title: 'WebSapMax - Menús Digitales para Restaurantes',
        description: 'La solución completa para digitalizar tu restaurante. Ofrece menús con QR, gestiona pedidos y reservas de forma eficiente.',
        keywords: ['restaurante', 'menú digital', 'código qr', 'gestión de pedidos', 'software para restaurantes'],
        ogTitle: 'WebSapMax: Digitaliza tu Restaurante Hoy',
        ogDescription: 'Atrae más clientes y optimiza tu operación con nuestra plataforma de menús digitales.',
        ogImage: 'https://placehold.co/1200x630.png',
    },
});

async function getPublicPlansForServer(): Promise<LandingPlan[]> {
    const coll = adminDb.collection('landingPlans');
    const q = coll.where('isActive', '==', true).where('isPublic', '==', true);
    const snapshot = await q.get();
    return snapshot.docs
      .map(doc => serializePlan(doc.id, doc.data()))
      .sort((a, b) => a.order - b.order);
}

async function getLandingConfigForServer(): Promise<LandingConfig> {
  const configDocRef = adminDb.collection('landing_configs').doc('main');
  const defaultConfig = getLandingDefaultConfigForServer();
  try {
    const docSnap = await configDocRef.get();
    if (!docSnap.exists) {
      console.warn("Server: Landing config not found. A default one will be used.");
      return defaultConfig;
    }
    const data = docSnap.data()!;
    return {
      ...defaultConfig,
      ...data,
      id: docSnap.id,
      sections: data.sections && data.sections.length > 0 ? data.sections : defaultConfig.sections,
      seo: { ...defaultConfig.seo, ...data.seo },
    };
  } catch (error) {
    console.error("Error fetching landing config on server:", error);
    throw new Error("Could not retrieve landing page configuration.");
  }
}


/**
 * Este es el componente de servidor para la página de inicio.
 * Ahora obtiene los datos directamente usando el SDK de Administrador para evitar problemas de permisos.
 */
export default async function LandingPage() {
  try {
    // Obtener todos los datos necesarios en paralelo
    const [publicPlans, config] = await Promise.all([
      getPublicPlansForServer(),
      getLandingConfigForServer(),
    ]);
    
    // Pasar los datos obtenidos a un componente de cliente para el renderizado
    return <LandingClient plans={publicPlans} config={config} />;

  } catch (error) {
    console.error("Failed to fetch landing page data (plans or config):", error);
    // Renderizar un estado de error claro si la obtención de datos falla
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center text-red-500 p-4">
            <h1 className="text-2xl font-bold">Error al cargar la página</h1>
            <p className="mt-2">No se pudieron obtener los datos necesarios. Por favor, intente más tarde.</p>
             {error instanceof Error && <p className="text-xs mt-4 bg-red-100 p-2 rounded-md">{error.message}</p>}
        </div>
    );
  }
}
