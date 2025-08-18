"use client";
import React, { lazy, Suspense } from "react";
import { SessionProvider, useSession } from "@/contexts/session-context";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

// ✅ LAZY LOADING: Solo cargar cuando sea necesario
const AppShell = lazy(() => import("@/components/layout/app-shell"));
const OrderProvider = lazy(() => import("@/contexts/order-context").then(module => ({ 
  default: module.OrderProvider 
})));

// Componente de loading para el lazy loading
const LazyLoadingSpinner = () => (
  <div className="flex min-h-svh w-full items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Cargando aplicación...</span>
  </div>
);

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

  // ✅ RUTAS PÚBLICAS: Layout liviano sin componentes pesados
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // ✅ RUTAS AUTENTICADAS: Lazy loading de componentes pesados
  if (currentUser) {
    return (
      <Suspense fallback={<LazyLoadingSpinner />}>
        <OrderProvider>
          <AppShell>{children}</AppShell>
        </OrderProvider>
      </Suspense>
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
