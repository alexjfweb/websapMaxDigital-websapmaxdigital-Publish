
import './globals.css';
import 'react-quill/dist/quill.snow.css'; // Importa los estilos de Quill aquí
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { ClientProviders } from '@/contexts/client-providers';
import ErrorBoundary from '@/components/ErrorBoundary';

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
                {children}
            </ClientProviders>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
