
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
const AuthenticatedRouteHandler = React.lazy(() => import('@/components/layout/AuthenticatedRouteHandler'));

// ✅ SMART ROUTER SIN DEPENDENCIAS PESADAS
function SmartRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <SimpleLoader message="Inicializando..." />;
  }

  // ✅ DEFINIR RUTAS PÚBLICAS
  const publicRoutes = ['/login', '/register', '/'];
  const isPublicMenuRoute = pathname.startsWith('/menu/');
  const isPublicRoute = publicRoutes.includes(pathname) || isPublicMenuRoute;

  // ✅ RUTAS PÚBLICAS: Layout súper liviano sin sesión
  if (isPublicRoute) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  // ✅ RUTAS PROTEGIDAS: Necesitan SessionProvider y todo el layout autenticado
  return (
    <Suspense fallback={<SimpleLoader message="Cargando componentes..." />}>
      <AuthenticatedRouteHandler>
        {children}
      </AuthenticatedRouteHandler>
    </Suspense>
  );
}

// ✅ PROVIDER PRINCIPAL ULTRA MINIMALISTA
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <SmartRouter>{children}</SmartRouter>;
}
