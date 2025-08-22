"use client";

import React from 'react';
import AppShell from '@/components/layout/app-shell';

// Este layout ahora solo envuelve a los hijos con el AppShell.
// El AppShell se encargará de toda la lógica de carga y autenticación.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
