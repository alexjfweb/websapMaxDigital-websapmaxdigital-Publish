
"use client";

import * as React from 'react';
import AppHeader from '@/components/layout/header';
import { useSession } from '@/contexts/session-context';
import { SidebarInset } from '@/components/ui/sidebar';

/**
 * Layout principal para las páginas públicas.
 * Se encarga de renderizar la cabecera (barra de navegación) y el contenido principal.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useSession();

  const handleLogout = () => {
    logout();
    // La redirección se maneja en el SessionProvider
  };

  return (
    <SidebarInset className="flex flex-col min-h-svh">
      {/* El AppHeader se renderiza aquí para todas las páginas que usan este layout */}
      <AppHeader currentUser={currentUser} handleLogout={handleLogout} />
      <main className="flex-1 bg-background">
        {children}
      </main>
    </SidebarInset>
  );
}
