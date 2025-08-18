
import './globals.css';
import { Inter } from 'next/font/google';
import ClientProviders from './ClientProviders';
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WebSapMax Digital Menu',
  description: 'La solución completa para gestionar tu restaurante.',
};

const ErrorFallback = ({ error, reset }: { error: Error, reset: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
        <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full border border-destructive/20">
            <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-destructive mb-2">Error al Cargar la Aplicación</h1>
            <p className="text-card-foreground mb-4">
                Hubo un problema al cargar una parte de la aplicación. Esto puede deberse a un problema de red temporal.
            </p>
            <Button onClick={reset} className="w-full">
                Intentar de Nuevo
            </Button>
        </div>
    </div>
);


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary fallback={<ErrorFallback error={new Error} reset={() => window.location.reload()} />}>
            <ClientProviders>
              {children}
            </ClientProviders>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
