"use client";

import React from 'react';
import AppShell from '@/components/layout/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';

// Este layout envuelve las páginas de empleados con el AppShell principal.
export default function EmployeeLayout({
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
