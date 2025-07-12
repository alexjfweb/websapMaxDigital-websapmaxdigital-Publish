
"use client"; 

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import { LogOut, Settings, UserCircle, Menu as MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { User } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';

const guestUser: User = {
  id: 'guest',
  username: 'guest',
  email: 'guest@example.com',
  name: 'Guest User',
  avatarUrl: 'https://placehold.co/100x100.png?text=G',
  role: 'guest',
  status: 'active',
  registrationDate: new Date(0).toISOString(), // Use a fixed, non-dynamic date
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Start with null
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser && parsedUser.email && parsedUser.role) {
          setCurrentUser(parsedUser);
        } else {
          // Data in localStorage is invalid
          localStorage.removeItem('currentUser');
          setCurrentUser(guestUser);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('currentUser');
        setCurrentUser(guestUser);
      }
    } else {
      setCurrentUser(guestUser);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(guestUser);
    toast({ title: t('header.logout'), description: t('appLayout.toastLogoutSuccess', {defaultValue: "You have been successfully logged out."}) }); 
    router.push('/login');
  };

  // Prevent rendering anything until the component is mounted and user state is determined
  if (!isMounted || !currentUser) {
    return (
      <div 
        className="flex min-h-svh w-full items-center justify-center bg-background"
        suppressHydrationWarning={true}
      >
        {t('appLayout.loading')}
      </div>
    );
  }

  const isSpecialPage = ['/login', '/register', '/'].includes(pathname);

  if (isSpecialPage) {
    return (
      <div className="flex flex-col min-h-svh">
        <AppHeader currentUser={currentUser} handleLogout={handleLogout} showSidebarRelatedUI={false} />
        <main className="flex-1 bg-background">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="p-4 flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="group-data-[collapsible=icon]:hidden">websapMax</span>
          </Link>
          {currentUser.role !== 'guest' ? (
            <div className="mt-1 text-center group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate max-w-[150px]">
                {currentUser.name || currentUser.username}
              </p>
              <p className="text-xs text-sidebar-foreground/80 capitalize">
                {t('appLayout.rolePrefix')}: {t(`userRoles.${currentUser.role}`, {defaultValue: currentUser.role})}
              </p>
            </div>
          ) : (
            <div className="mt-1 text-center group-data-[collapsible=icon]:hidden">
              <p className="text-sm text-sidebar-foreground/80">
                {t('appLayout.guestAccess')}
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
                        <AvatarImage src={currentUser.avatarUrl || `https://placehold.co/40x40.png?text=${currentUser.name?.substring(0,1).toUpperCase()}`} alt={currentUser.name || 'User'} data-ai-hint="user avatar" />
                        <AvatarFallback>{currentUser.name ? currentUser.name.substring(0,1).toUpperCase() : currentUser.username.substring(0,1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="group-data-[collapsible=icon]:hidden flex flex-col items-start">
                        <span className="text-sm font-medium truncate max-w-[120px]">{currentUser.name || currentUser.username}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{currentUser.email}</span>
                      </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mb-2 ml-2" side="top" align="start">
                  <DropdownMenuLabel>{t('header.myAccount')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem disabled> 
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>{t('header.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('header.settings')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('header.logout')}</span>
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
  );
}
