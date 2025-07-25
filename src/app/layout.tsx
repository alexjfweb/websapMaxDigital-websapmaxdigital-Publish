// import '../lib/i18n';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './ClientProviders';

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
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
