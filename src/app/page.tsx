// src/app/page.tsx (Server Component)

import React from 'react';
import { landingPlansService } from '@/services/landing-plans-service';
import { landingConfigService } from '@/services/landing-config-service';
import LandingClient from './landing-client'; // Import the client component

/**
 * This is a React Server Component (RSC).
 * It fetches data on the server at build time or request time.
 * The fetched data is then passed as simple props to a Client Component.
 * This pattern is robust, performant, and avoids hydration errors.
 */
export default async function LandingPage() {
  try {
    // Fetch both config and plans directly on the server.
    const [config, plans] = await Promise.all([
      landingConfigService.getLandingConfig(),
      landingPlansService.getPlans()
    ]);
    
    // The data is now serialized and ready to be passed to a client component.
    return <LandingClient config={config} plans={plans} />;

  } catch (error) {
    console.error("Failed to fetch landing page data:", error);
    // Render a simple error state if data fetching fails on the server.
    // The LandingClient component also has its own error display for client-side issues.
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center text-red-500">
            <h1 className="text-2xl font-bold">Error al cargar la página</h1>
            <p>No se pudieron obtener los datos necesarios. Por favor, intente más tarde.</p>
        </div>
    );
  }
}
