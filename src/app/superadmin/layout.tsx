"use client";

import React from 'react';
import AppShell from '@/components/layout/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';

// Este layout ahora solo envuelve a los hijos con el AppShell y su proveedor.
export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <AppShell>{children}</AppShell>
    </SidebarProvider>
  );
}
