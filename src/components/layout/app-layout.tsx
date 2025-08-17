
"use client";

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/header';
import { useSession } from '@/contexts/session-context';

// Este componente ahora es mucho más simple. Actúa como un contenedor general.
// La lógica de Sidebar y layouts complejos se ha movido a AppShell.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, logout } = useSession();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-svh">
      {/* El AppHeader ahora se renderiza aquí para las páginas públicas */}
      <AppHeader currentUser={currentUser} handleLogout={handleLogout} />
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  );
}
