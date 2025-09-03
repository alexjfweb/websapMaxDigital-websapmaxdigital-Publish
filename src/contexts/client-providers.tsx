"use client";

import { SessionProvider } from '@/contexts/session-context';
import { OrderProvider } from '@/contexts/order-context';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OrderProvider>
        {children}
      </OrderProvider>
    </SessionProvider>
  );
}
