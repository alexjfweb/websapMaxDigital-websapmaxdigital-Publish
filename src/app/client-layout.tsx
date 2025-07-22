"use client";
import React, { useEffect } from 'react';
import { OrderProvider } from '@/contexts/order-context';
import AppLayout from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { SWRConfig } from "swr";

export default function ClientLayout({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    // Función para asegurar que la base de datos esté sincronizada
    const ensureDatabaseSync = async () => {
      try {
        // Hacemos una solicitud a la API de sincronización
        const response = await fetch('/api/sync-database', { method: 'POST' });
        const data = await response.json();
        console.log('Sync response:', data.message);
      } catch (error) {
        console.error('Failed to sync database on startup:', error);
      }
    };

    // Ejecutar la sincronización al cargar la aplicación
    ensureDatabaseSync();
  }, []);


  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 30000, // 30 segundos
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 2000,
      }}
    >
      <OrderProvider>
        <AppLayout>
            {children}
        </AppLayout>
        <Toaster />
      </OrderProvider>
    </SWRConfig>
  );
}
