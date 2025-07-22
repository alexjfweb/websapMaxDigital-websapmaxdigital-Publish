// import '../lib/i18n';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WebSapMaxDigital',
  description: 'Tu solución digital definitiva para menús de restaurante',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
