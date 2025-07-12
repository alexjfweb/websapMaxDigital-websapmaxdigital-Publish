import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layout/app-layout';
import { LanguageProvider } from '@/contexts/language-context';

const inter = Inter({
  subsets: ['latin'],
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
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <LanguageProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
