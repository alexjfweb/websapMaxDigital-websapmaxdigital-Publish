"use client";
import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SessionProvider, useSession } from '@/contexts/session-context';
import { OrderProvider } from '@/contexts/order-context';
import AppLayout from "@/components/layout/app-layout"; // Importar el layout principal

// Componente de carga simple
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

// Layout para páginas públicas - AHORA USA AppLayout para incluir el header
function PublicLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

// Usamos React.lazy para cargar el AppShell solo cuando se necesita
const AuthenticatedLayout = React.lazy(() => import('@/components/layout/app-shell'));

// Componente que decide qué layout renderizar
function RouteController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isLoading } = useSession();

  // Rutas que no requieren el layout de la aplicación (AppShell)
  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/menu/');

  if (isLoading) {
    return <SimpleLoader message="Verificando sesión..." />;
  }

  if (isPublicRoute) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  // Si no es una ruta pública y no hay usuario, el SessionProvider ya se encarga de redirigir.
  // Mientras tanto, mostramos un loader para evitar parpadeos.
  if (!currentUser) {
      return <SimpleLoader message="Redirigiendo..." />;
  }
  
  // Si es una ruta protegida y hay un usuario, cargamos el layout completo.
  // Usamos Suspense para mostrar un loader mientras se carga el código del AppShell.
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

// El proveedor principal envuelve toda la aplicación en el SessionProvider
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RouteController>{children}</RouteController>
    </SessionProvider>
  );
}
