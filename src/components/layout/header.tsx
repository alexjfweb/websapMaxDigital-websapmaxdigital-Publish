"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Bell, UserCircle, Settings, LogOut, Menu as MenuIcon, LogIn as LogInIcon, Globe, ArrowLeft, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types';

interface AppHeaderProps {
  currentUser: User;
  handleLogout: () => void;
  showSidebarRelatedUI: boolean; 
}

function ConditionalSidebarTrigger() {
  const { isMobile } = useSidebar(); 
  if (!isMobile) return null;

  return (
    <SidebarTrigger asChild>
      <Button variant="ghost" size="icon"><MenuIcon /></Button>
    </SidebarTrigger>
  );
}

export default function AppHeader({ currentUser, handleLogout, showSidebarRelatedUI }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  // Función para manejar el botón "Volver"
  const handleGoBack = () => {
    if (pathname === '/login') {
      router.push('/'); // Ir al home público
    } else if (pathname === '/register') {
      router.push('/login'); // Volver al login
    } else {
      router.back(); // Usar historial del navegador
    }
  };

  // Función para manejar el botón "Siguiente"
  const handleGoNext = () => {
    if (pathname === '/login') {
      router.push('/register'); // Ir al registro
    } else if (pathname === '/register') {
      router.push('/login'); // Volver al login (o podría ir a una guía)
    } else if (pathname === '/') {
      router.push('/login'); // Ir al login desde home
    } else {
      // Para otras páginas, podría mostrar una guía o ir al siguiente paso lógico
      router.push('/login');
    }
  };

  // Determinar si mostrar los botones de navegación
  const showNavigationButtons = ['/login', '/register', '/'].includes(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 shadow-sm">
      {showSidebarRelatedUI && (
        <React.Suspense fallback={null}>
          <ConditionalSidebarTrigger />
        </React.Suspense>
      )}
      
      {/* Botones de navegación - siempre visibles */}
      {showNavigationButtons && (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGoBack}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGoNext}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex-1">
        {/* Optional: Search bar or other header elements can go here */}
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
            <DropdownMenuItem key="es" onSelect={() => {}}>
              <span className="mr-2">🇪🇸</span>
              Español
              <span className="ml-auto text-xs text-muted-foreground">Actual</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        {currentUser && currentUser.role !== 'guest' ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser.avatarUrl || `https://placehold.co/40x40.png?text=${currentUser.name?.substring(0,1).toUpperCase()}`} alt={currentUser.name || 'User'} data-ai-hint="user avatar" />
                  <AvatarFallback>{currentUser.name ? currentUser.name.substring(0,1).toUpperCase() : currentUser.username.substring(0,1).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name || currentUser.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem disabled>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
