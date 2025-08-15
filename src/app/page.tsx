
import { Suspense } from 'react';
import { landingConfigService } from '@/services/landing-config-service';
import { landingPlansService } from '@/services/landing-plans-service';
import ErrorBoundary from '@/components/ErrorBoundary';
import LandingClient, { PlanSkeleton, ErrorDisplay } from './landing-client';

export default async function LandingPage() {
  try {
    const config = await landingConfigService.getLandingConfig();
    const plans = await landingPlansService.getPlans();

    return (
      <ErrorBoundary fallback={<ErrorDisplay error={new Error("Error al renderizar los datos de la landing.")} />}>
        <Suspense fallback={<PlanSkeleton />}>
          <LandingClient config={config} plans={plans} />
        </Suspense>
      </ErrorBoundary>
    );
  } catch (error: any) {
    // Si la obtención de datos falla, mostramos el error
    return <ErrorDisplay error={error} />;
  }
}
