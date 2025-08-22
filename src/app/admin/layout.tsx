
"use client";

import React from 'react';
import AppShell from '@/components/layout/app-shell';

// Este layout ahora solo envuelve a los hijos con el AppShell.
// La lógica de carga y autenticación se ha movido al AppShell.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
