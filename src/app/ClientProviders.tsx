
"use client";
import React from "react";
import { SessionProvider } from '@/contexts/session-context';
import { OrderProvider } from '@/contexts/order-context';
import AuthenticatedRouteHandler from "@/components/layout/AuthenticatedRouteHandler";
import AppLayout from "@/components/layout/app-layout";
import { usePathname } from "next/navigation";


function LayoutDecider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/menu/');

    if (isPublicRoute) {
        return <AppLayout>{children}</AppLayout>
    }

    // Para todas las demás rutas, usamos el handler que protege
    // y muestra el AppShell con la barra lateral, etc.
    return (
        <AuthenticatedRouteHandler>
            {children}
        </AuthenticatedRouteHandler>
    );
}


export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
        <LayoutDecider>{children}</LayoutDecider>
    </SessionProvider>
  );
}
