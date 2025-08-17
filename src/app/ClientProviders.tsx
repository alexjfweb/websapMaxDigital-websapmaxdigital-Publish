
"use client";
import React from "react";
import AppShell from "@/components/layout/app-shell"; 
import { SessionProvider, useSession } from "@/contexts/session-context";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { OrderProvider } from "@/contexts/order-context";

// Componente que decide qué layout renderizar
function LayoutDecider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isLoading } = useSession();

  // Define las rutas que no usarán el AppShell (el layout con sidebar, etc.)
  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/menu/');

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verificando sesión...</span>
      </div>
    );
  }

  // Si estamos en una ruta pública, no renderizamos el AppShell.
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Si no es una ruta pública y hay un usuario, renderizamos el AppShell
  // que ahora incluye el OrderProvider.
  if (currentUser) {
    return (
      <OrderProvider>
        <AppShell>{children}</AppShell>
      </OrderProvider>
    );
  }

  // Fallback mientras se redirige a /login
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LayoutDecider>{children}</LayoutDecider>
    </SessionProvider>
  );
}
