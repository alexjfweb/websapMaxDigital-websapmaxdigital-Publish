import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { ClientProviders } from '@/contexts/client-providers';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppShell from '@/components/layout/app-shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WebSapMax Digital Menu',
  description: 'La solución completa para gestionar tu restaurante.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
            <ClientProviders>
                <AppShell>
                    {children}
                </AppShell>
            </ClientProviders>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
