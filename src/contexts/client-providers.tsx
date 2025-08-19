
"use client";

import React from 'react';
import { SessionProvider } from '@/contexts/session-context';
import { OrderProvider } from '@/contexts/order-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import ErrorBoundary from '@/components/ErrorBoundary';

/**
 * Este componente agrupa todos los providers del lado del cliente.
 * Su única responsabilidad es establecer los contextos necesarios para la aplicación.
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <SidebarProvider>
            <OrderProvider>
              {children}
            </OrderProvider>
        </SidebarProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
