"use client";

import { SessionProvider } from '@/contexts/session-context';
import { OrderProvider } from '@/contexts/order-context';
import { SidebarProvider } from '@/components/ui/sidebar';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OrderProvider>
        {/* El SidebarProvider ya no es necesario aquí si AppShell lo gestiona internamente
            o si se decide que AppShell es el único lugar donde se usa.
            Si el SidebarProvider es necesario para otros componentes fuera de AppShell,
            se debe mantener. Por ahora lo dejamos por seguridad. */}
        <SidebarProvider>
            {children}
        </SidebarProvider>
      </OrderProvider>
    </SessionProvider>
  );
}
