// src/app/page.tsx (Server Component)
import 'server-only';
import React from 'react';
import { landingPlansService } from '@/services/landing-plans-service';
import { landingConfigService } from '@/services/landing-config-service';
import LandingClient from './landing-client'; // Import the client component

/**
 * This is a React Server Component (RSC).
 * It fetches data on the server at build time or request time.
 * The fetched data is then passed as simple props to a Client Component.
 */
export default async function LandingPage() {
  try {
    // Fetch all necessary data in parallel
    const [publicPlans, config] = await Promise.all([
      landingPlansService.getPublicPlans(),
      landingConfigService.getLandingConfig(),
    ]);
    
    // The data is now serialized and ready to be passed to a client component.
    return <LandingClient plans={publicPlans} config={config} />;

  } catch (error) {
    console.error("Failed to fetch landing page data (plans or config):", error);
    // Render a simple error state if data fetching fails on the server.
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center text-red-500 p-4">
            <h1 className="text-2xl font-bold">Error al cargar la página</h1>
            <p className="mt-2">No se pudieron obtener los datos necesarios. Por favor, intente más tarde.</p>
             {error instanceof Error && <p className="text-xs mt-4 bg-red-100 p-2 rounded-md">{error.message}</p>}
        </div>
    );
  }
}
