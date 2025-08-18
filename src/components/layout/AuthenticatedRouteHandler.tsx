
"use client";

import React, { Suspense } from 'react';
import { SessionProvider, useSession } from '@/contexts/session-context';
import AppShell from './app-shell';
import { OrderProvider } from '@/contexts/order-context';
import { Loader2 } from 'lucide-react';

function SimpleLoader({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}


// Este componente interno maneja la lógica de la sesión y renderiza el AppShell
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useSession();

  if (isLoading) {
    return <SimpleLoader message="Verificando sesión..." />;
  }

  // El SessionProvider se encarga de la redirección, así que si llegamos aquí sin usuario
  // es un estado transitorio antes de redirigir.
  if (!currentUser) {
    return <SimpleLoader message="Redirigiendo..." />;
  }

  return (
    <OrderProvider>
      <AppShell>{children}</AppShell>
    </OrderProvider>
  );
}

// El componente exportado envuelve todo en el SessionProvider
export default function AuthenticatedRouteHandler({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </SessionProvider>
  );
}
