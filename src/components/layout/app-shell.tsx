"use client";

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from '@/contexts/session-context';
import AuthenticatedRouteHandler from './AuthenticatedRouteHandler';
import AppHeader from './header';

/**
 * Este componente ahora actúa como el controlador principal del layout.
 * Decide si mostrar una página pública, el cargador, o el layout completo del panel de admin.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useSession();
  const pathname = usePathname();
  
  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/menu/');

  // Si la ruta es pública, la renderizamos directamente dentro de una estructura mínima
  // que incluye el header.
  if (isPublicRoute) {
    return (
      <div className="flex flex-col min-h-svh">
        <AppHeader />
        <main className="flex-1 bg-background">{children}</main>
      </div>
    );
  }

  // Para el resto de las rutas (que son protegidas), usamos el AuthenticatedRouteHandler
  // que se encargará de mostrar el cargador, redirigir si es necesario, o mostrar
  // el contenido protegido dentro del layout del panel.
  return (
    <AuthenticatedRouteHandler>
      {children}
    </AuthenticatedRouteHandler>
  );
}