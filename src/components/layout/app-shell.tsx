
"use client";

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/contexts/session-context';
import AppHeader from './header';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarRail,
  useSidebar, 
} from '@/components/ui/sidebar';
import NavigationMenu from '@/components/layout/navigation-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, UserCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import FooterNavigation from './footer-navigation';
import { OrderProvider } from '@/contexts/order-context';


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

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { currentUser, isLoading, logout } = useSession();
    const { setOpenMobile } = useSidebar();
    const router = useRouter();

    const handleLogout = () => {
      logout();
      router.push('/login');
    };

    // Este componente ahora asume que SOLO se renderiza en rutas de admin.
    // La lógica de redirección sigue siendo importante en el SessionProvider.
    
    if (isLoading) {
        return <AdminLoader />;
    }

    if (!currentUser) {
        // Aunque el SessionProvider redirige, podemos mostrar un loader
        // mientras ocurre la redirección para evitar un parpadeo de contenido.
        return <AdminLoader />;
    }

    const profileLink = currentUser.role === 'superadmin' ? '/superadmin/profile' : '/admin/profile';

    const handleMobileLinkClick = () => {
        setOpenMobile(false);
    };

    // Renderiza el layout de administración completo.
    return (
        <OrderProvider>
            <Sidebar collapsible="icon" variant="sidebar" side="left">
                <SidebarHeader className="p-4 flex flex-col items-center gap-2">
                <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <span className="group-data-[collapsible=icon]:hidden">websapMax</span>
                </Link>
                <div className="mt-1 text-center group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium text-sidebar-foreground truncate max-w-[150px]">
                    {currentUser.businessName || currentUser.name || currentUser.username}
                    </p>
                    <p className="text-xs text-sidebar-foreground/80 capitalize">
                    Rol: {currentUser.role}
                    </p>
                </div>
                </SidebarHeader>
                <SidebarContent className="flex-grow">
                <NavigationMenu role={currentUser.role} onLinkClick={handleMobileLinkClick} />
                </SidebarContent>
                <SidebarFooter className="p-2 mt-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name || 'User'} />
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
                        <DropdownMenuItem asChild>
                            <Link href={profileLink}>
                                <UserCircle className="mr-2 h-4 w-4" />
                                <span>Perfil</span>
                            </Link>
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
            </Sidebar>
            <SidebarRail />
            <SidebarInset className="flex flex-col">
                <AppHeader />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background pb-20 md:pb-8">
                {children}
                </main>
                <FooterNavigation role={currentUser.role} />
            </SidebarInset>
        </OrderProvider>
    );
}

    