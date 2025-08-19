"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, LogIn as LogInIcon, Globe } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useSession } from '@/contexts/session-context';

export default function AppHeader() {
  const { currentUser } = useSession();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 shadow-sm">
      {/* El trigger del Sidebar solo se muestra si hay un usuario logueado */}
      {currentUser && (
          <SidebarTrigger />
      )}
      
      <div className="flex-1">
        {/* Espacio para futuros elementos como una barra de búsqueda */}
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Seleccionar idioma</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Seleccionar idioma</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {languages.map((lang) => (
                <DropdownMenuItem key={lang.code} onSelect={() => {}}>
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
                {lang.code === 'es' && <span className="ml-auto text-xs text-muted-foreground">Actual</span>}
                </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {currentUser ? (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificaciones</span>
          </Button>
        ) : (
          <Link href="/login" passHref>
            <Button variant="outline">
              <LogInIcon className="mr-2 h-4 w-4" />
              Iniciar sesión
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
