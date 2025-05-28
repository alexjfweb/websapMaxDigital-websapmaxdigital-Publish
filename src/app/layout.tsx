import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist to Inter
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layout/app-layout';

const inter = Inter({ // Changed from geistSans to inter
  subsets: ['latin'],
  variable: '--font-inter', // Changed variable name
});

export const metadata: Metadata = {
  title: 'websapMax Digital Menu',
  description: 'Interactive digital menu for websapMax restaurant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
