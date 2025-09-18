
"use client";

import React from 'react';
import AppShell from '@/components/layout/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';
import { OrderProvider } from '@/contexts/order-context';

// Este layout ahora solo envuelve a los hijos con el AppShell y su proveedor.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <OrderProvider>
        <AppShell>{children}</AppShell>
      </OrderProvider>
    </SidebarProvider>
  );
}
