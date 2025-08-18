
"use client";
import React from "react";
import { SessionProvider } from '@/contexts/session-context';
import { OrderProvider } from '@/contexts/order-context';
import AuthenticatedRouteHandler from "@/components/layout/AuthenticatedRouteHandler";
import AppLayout from "@/components/layout/app-layout";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppShell from "@/components/layout/app-shell";


function LayoutDecider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/menu/');

    if (isPublicRoute) {
        // Para las rutas públicas, solo usamos el layout simple que incluye la cabecera.
        // AppShell se encarga de la estructura principal incluyendo el sidebar.
        return <AppLayout>{children}</AppLayout>;
    }

    // Para todas las demás rutas, usamos el handler que protege
    // y luego renderiza el contenido dentro del layout principal con sidebar.
    return (
        <AuthenticatedRouteHandler>
            <AppShell>{children}</AppShell>
        </AuthenticatedRouteHandler>
    );
}


export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SessionProvider>
        <OrderProvider>
          <LayoutDecider>{children}</LayoutDecider>
        </OrderProvider>
      </SessionProvider>
    </SidebarProvider>
  );
}
