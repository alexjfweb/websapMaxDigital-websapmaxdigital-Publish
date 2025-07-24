// src/app/layout.tsx
"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import ClientProviders from './ClientProviders';
import { Toaster } from '@/components/ui/toaster';
import React, { useEffect } from 'react';
import { databaseSyncService } from '@/services/database-sync-service';
import { useToast } from '@/hooks/use-toast';

const inter = Inter({
  subsets: ['latin'],
});

// Metadata se maneja de manera diferente en el App Router,
// usualmente en un `page.tsx` o en un `layout.ts` exportando un objeto `metadata`.
// Por ahora, lo mantenemos simple.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();

  useEffect(() => {
    const runSync = async () => {
      try {
        console.log('Ejecutando sincronización de base de datos...');
        const message = await databaseSyncService.syncLandingPlans('system-init', 'system@init.com');
        console.log(message);
        if (message.includes('crearon')) {
           toast({
            title: "Sistema inicializado",
            description: "Los planes de ejemplo han sido creados.",
          });
        }
      } catch (error) {
        console.error("Fallo la sincronización automática:", error);
         toast({
            title: "Error de Sincronización",
            description: "No se pudo inicializar la base de datos.",
            variant: "destructive",
          });
      }
    };
    runSync();
  }, [toast]);


  return (
    <html lang="es">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientProviders>{children}</ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}
