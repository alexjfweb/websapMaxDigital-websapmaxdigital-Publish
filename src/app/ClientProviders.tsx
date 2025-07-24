
"use client";
import React from "react";
import AppLayout from "@/components/layout/app-layout";
import { OrderProvider } from "@/contexts/order-context";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
      <OrderProvider>
        <AppLayout>{children}</AppLayout>
      </OrderProvider>
  );
}
