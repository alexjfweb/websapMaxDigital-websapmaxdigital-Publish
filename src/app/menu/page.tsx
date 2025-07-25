// This file is no longer needed as we are moving to a dynamic route structure.
// The new page is located at /app/menu/[restaurantId]/page.tsx.
// This file can be deleted.
'use client';
import React from 'react';
import { LoaderCircle } from 'lucide-react';

export default function MenuRedirectPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-bold">Cargando Menú</h1>
        <p className="text-muted-foreground">
          Esta página ha sido movida. Serás redirigido en breve.
        </p>
    </div>
  );
}
