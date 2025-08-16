// src/app/layout.tsx (¡SIN "use client"!)

import './globals.css';
import { Inter } from 'next/font/google';
import ClientProviders from './ClientProviders';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
