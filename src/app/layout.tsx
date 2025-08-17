// src/app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import ClientProviders from './ClientProviders';
import React from 'react';
import { Toaster } from "@/components/ui/toaster"; // Mover Toaster aquí

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WebSapMax Digital Menu',
  description: 'La solución completa para gestionar tu restaurante.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}
