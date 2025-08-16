// src/app/page.tsx (Server Component)

import React from 'react';
import { landingPlansService } from '@/services/landing-plans-service';
import LandingClient from './landing-client'; // Import the client component

/**
 * This is a React Server Component (RSC).
 * It fetches data on the server at build time or request time.
 * The fetched data is then passed as simple props to a Client Component.
 */
export default async function LandingPage() {
  try {
    // Fetch all plans from the service
    const allPlans = await landingPlansService.getPlans();
    
    // Filter plans to show only those marked as active and public
    const publicPlans = allPlans.filter(plan => plan.isActive && plan.isPublic);
    
    // The data is now serialized and ready to be passed to a client component.
    return <LandingClient plans={publicPlans} />;

  } catch (error) {
    console.error("Failed to fetch landing page data (plans):", error);
    // Render a simple error state if data fetching fails on the server.
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center text-red-500">
            <h1 className="text-2xl font-bold">Error al cargar la página</h1>
            <p>No se pudieron obtener los datos necesarios. Por favor, intente más tarde.</p>
        </div>
    );
  }
}
