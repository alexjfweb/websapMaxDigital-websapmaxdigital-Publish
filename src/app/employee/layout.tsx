
"use client";

import React from 'react';
import AppShell from '@/components/layout/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';
import { OrderProvider } from '@/contexts/order-context';

// Este layout envuelve las páginas de empleados con el AppShell principal.
export default function EmployeeLayout({
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
