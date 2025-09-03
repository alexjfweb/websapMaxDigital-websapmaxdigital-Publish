
"use client";

import React from 'react';
import AppShell from '@/components/layout/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';

// Este layout aplica el AppShell a todas las rutas de superadmin
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
