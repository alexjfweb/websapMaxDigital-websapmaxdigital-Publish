// src/app/page.tsx (Server Component)
import 'server-only';
import React from 'react';
import LandingClient from './landing-client';
import { landingConfigService } from '@/services/landing-config-service';
import { landingPlansService } from '@/services/landing-plans-service';

// Esta página ahora solo pre-renderiza el contenedor.
// Los datos se cargarán en el lado del cliente.
export default function LandingPage() {
  return <LandingClient />;
}
