"use client";

import { SessionProvider } from '@/contexts/session-context';
import { OrderProvider } from '@/contexts/order-context';
import { SidebarProvider } from '@/components/ui/sidebar';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OrderProvider>
        <SidebarProvider>
            {children}
        </SidebarProvider>
      </OrderProvider>
    </SessionProvider>
  );
}
