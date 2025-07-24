
"use client";

import * as React from 'react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import AppHeader from '@/components/layout/header';
import NavigationMenu from '@/components/layout/navigation-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, UserCircle, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

const guestUser: User = {
  id: 'guest',
  username: 'guest',
  email: 'guest@example.com',
  name: 'Guest User',
  avatarUrl: 'https://placehold.co/100x100.png?text=G',
  role: 'guest',
  status: 'active',
  registrationDate: '2022-01-01T00:00:00Z',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<User>(guestUser);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.email && parsedUser.role) {
          setCurrentUser(parsedUser);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
      setCurrentUser(guestUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(guestUser);
    toast({ title: 'Cerrar sesión', description: 'Sesión cerrada correctamente' }); 
    router.push('/login');
  };
  
  const isSpecialPage = ['/login', '/register', '/'].includes(pathname);

  if (!isClient) {
    return (
        <div className="flex min-h-svh w-full items-center justify-center bg-background">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      {isSpecialPage ? (
        <div className="flex flex-col min-h-svh">
          <AppHeader currentUser={currentUser} handleLogout={handleLogout} showSidebarRelatedUI={false} />
          <main className="flex-1 bg-background">
            {children}
          </main>
        </div>
      ) : (
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="icon" variant="sidebar" side="left">
            <SidebarHeader className="p-4 flex flex-col items-center gap-2">
              <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span className="group-data-[collapsible=icon]:hidden">websapMax</span>
              </Link>
              {currentUser.role !== 'guest' && (
                <div className="mt-1 text-center group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium text-sidebar-foreground truncate max-w-[150px]">
                    {currentUser.name || currentUser.username}
                  </p>
                  <p className="text-xs text-sidebar-foreground/80 capitalize">
                    Rol: {currentUser.role === 'Employee' ? 'Empleado' : currentUser.role === 'Admin' ? 'Administrador' : currentUser.role === 'SuperAdmin' ? 'Superadministrador' : currentUser.role}
                  </p>
                </div>
              )}
            </SidebarHeader>
            <SidebarContent className="flex-grow">
              <NavigationMenu role={currentUser.role} />
            </SidebarContent>
            {currentUser.role !== 'guest' && (
              <SidebarFooter className="p-2 mt-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name || 'User'} data-ai-hint="user avatar" />
                            <AvatarFallback>{currentUser.name ? currentUser.name.substring(0,1).toUpperCase() : currentUser.username.substring(0,1).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="group-data-[collapsible=icon]:hidden flex flex-col items-start">
                            <span className="text-sm font-medium truncate max-w-[120px]">{currentUser.name || currentUser.username}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{currentUser.email}</span>
                          </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2 ml-2" side="top" align="start">
                      <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
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
              </SidebarFooter>
            )}
          </Sidebar>
          <SidebarRail />
          <SidebarInset className="flex flex-col">
            <AppHeader currentUser={currentUser} handleLogout={handleLogout} showSidebarRelatedUI={true} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      )}
    </>
  );
}
