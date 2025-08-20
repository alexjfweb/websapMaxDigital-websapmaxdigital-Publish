
"use client";

import React from 'react';
import { useSession } from '@/contexts/session-context';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';
import { Loader2 } from 'lucide-react';

function AdminLoader() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Verificando sesión...</p>
            </div>
        </div>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [isLoading, currentUser, router]);

  if (isLoading || !currentUser) {
    return <AdminLoader />;
  }

  // Render the AppShell for authenticated users in admin routes
  return <AppShell>{children}</AppShell>;
}
