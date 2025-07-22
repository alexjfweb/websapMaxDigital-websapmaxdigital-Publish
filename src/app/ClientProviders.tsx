"use client";
import React from "react";
import { SWRConfig } from "swr";
import ClientLayout from "./client-layout";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
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
      <ClientLayout>{children}</ClientLayout>
    </SWRConfig>
  );
} 