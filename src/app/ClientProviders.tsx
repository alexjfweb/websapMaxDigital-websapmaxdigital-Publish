
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SessionProvider, useSession } from '@/contexts/session-context';
import { OrderProvider } from '@/contexts/order-context';

// ✅ COMPONENTE PÚBLICO PURO: Sin importaciones pesadas
function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ✅ LOADING COMPONENT SIMPLE
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

// ✅ MANEJADOR DE RUTAS AUTENTICADAS (Lazy loaded)
const AuthenticatedLayout = React.lazy(() => import('@/components/layout/app-shell'));

// Este componente interno tiene acceso al contexto de sesión
function RouteController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isLoading } = useSession();

  // Define las rutas que no usarán el AppShell (el layout con sidebar, etc.)
  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/menu/');
  
  if (isLoading) {
    return <SimpleLoader message="Verificando sesión..." />;
  }

  if (isPublicRoute) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  // Si no es ruta pública y no hay usuario, SessionProvider redirigirá.
  // Mientras tanto, mostramos un loader.
  if (!currentUser) {
      return <SimpleLoader message="Redirigiendo..." />;
  }
  
  // Si es una ruta protegida y hay usuario, renderiza el layout autenticado.
  return (
    <Suspense fallback={<SimpleLoader message="Cargando panel..." />}>
      <OrderProvider>
        <AuthenticatedLayout>
            {children}
        </AuthenticatedLayout>
      </OrderProvider>
    </Suspense>
  );
}

// ✅ PROVIDER PRINCIPAL: Envuelve todo en el SessionProvider
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RouteController>{children}</RouteController>
    </SessionProvider>
  );
}
