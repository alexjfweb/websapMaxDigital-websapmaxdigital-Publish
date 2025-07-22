"use client";
import React from 'react';
import { OrderProvider } from '@/contexts/order-context';
import AppLayout from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { SWRConfig } from "swr";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
