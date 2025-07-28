
// src/app/layout.tsx
"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import ClientProviders from './ClientProviders';
import { Toaster } from '@/components/ui/toaster';
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';


const inter = Inter({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();

  useEffect(() => {
    // La lógica de inicialización y verificación de datos se ha movido
    // a componentes más específicos o a flujos de usuario para evitar
    // errores de conexión durante la carga inicial de la aplicación.
    // Esto resuelve el problema de "client is offline".
    console.log("RootLayout montado. La conexión a Firebase es manejada por los servicios y hooks individuales.");
  }, []);


  return (
    <html lang="es">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientProviders>{children}</ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}
