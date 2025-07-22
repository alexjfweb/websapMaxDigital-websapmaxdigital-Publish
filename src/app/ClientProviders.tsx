
"use client";
import React from "react";
import { SWRConfig } from "swr";
import AppLayout from "@/components/layout/app-layout";
import { OrderProvider } from "@/contexts/order-context";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const swrConfig = {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    dedupingInterval: 2000,
  };
  
  React.useEffect(() => {
    const ensureDatabaseSync = async () => {
      try {
        const response = await fetch('/api/sync-database', { method: 'POST' });
        const data = await response.json();
        console.log('Sync response:', data.message);
      } catch (error) {
        console.error('Failed to sync database on startup:', error);
      }
    };

    ensureDatabaseSync();
  }, []);


  return (
    <SWRConfig value={swrConfig}>
      <OrderProvider>
        <AppLayout>{children}</AppLayout>
      </OrderProvider>
    </SWRConfig>
  );
}
