
"use client";

import React from 'react';
import { useSession } from '@/contexts/session-context';
import { Loader2 } from 'lucide-react';

function SimpleLoader({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Este componente ahora solo se encarga de la lógica de carga y protección,
// sin renderizar el AppShell directamente.
export default function AuthenticatedRouteHandler({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useSession();

  if (isLoading) {
    return <SimpleLoader message="Verificando sesión..." />;
  }

  // El SessionProvider se encarga de la redirección, así que si llegamos aquí sin usuario
  // es un estado transitorio antes de redirigir.
  if (!currentUser) {
    return <SimpleLoader message="Redirigiendo..." />;
  }

  // Si el usuario está autenticado y no estamos cargando, renderizamos los hijos.
  // El layout (AppShell) será proveído por el LayoutDecider en ClientProviders.
  return <>{children}</>;
}
