
"use client";
import React from "react";
import AppLayout from "@/components/layout/app-layout";
import { OrderProvider } from "@/contexts/order-context";
import { SessionProvider } from "@/contexts/session-context";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OrderProvider>
        <AppLayout>{children}</AppLayout>
      </OrderProvider>
    </SessionProvider>
  );
}
