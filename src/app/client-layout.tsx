"use client";
import React from 'react';
import { OrderProvider } from '@/contexts/order-context';
import AppLayout from '@/components/layout/app-layout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrderProvider>
      <AppLayout>{children}</AppLayout>
    </OrderProvider>
  );
} 