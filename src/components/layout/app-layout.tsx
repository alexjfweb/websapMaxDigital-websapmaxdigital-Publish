
"use client"; // Required for useState and useEffect

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
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
import { LogOut, Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { User, UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';

const guestUser: User = {
  id: 'guest',
  username: 'guest',
  email: 'guest@example.com',
  name: 'Guest User',
  avatarUrl: 'https://placehold.co/100x100.png?text=G',
  role: 'guest',
  status: 'active',
  registrationDate: new Date().toISOString(),
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const [currentUser, setCurrentUser] = useState<User>(guestUser);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); 
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser && parsedUser.email && parsedUser.role && (parsedUser.name || parsedUser.username)) {
          setCurrentUser(parsedUser);
        } else {
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
  }, [pathname]); // Add pathname to dependency array
  
  useEffect(() => {
    if (!isMounted) return;

    const protectedRoutesPrefixes = ['/admin', '/superadmin', '/employee'];
    // Use the pathname from usePathname instead of window.location.pathname for consistency with Next.js routing
    const currentPath = pathname; 
    const isGuest = currentUser.role === 'guest';

    if (isGuest && protectedRoutesPrefixes.some(prefix => currentPath.startsWith(prefix))) {
      toast({ title: "Access Denied", description: "Please log in to access this page.", variant: "destructive" });
      router.push('/login');
    } else if (!isGuest && (currentPath === '/login' || currentPath === '/register')) {
        let dashboardPath = "/menu"; 
        switch(currentUser.role) {
            case "admin": dashboardPath = "/admin/dashboard"; break;
            case "superadmin": dashboardPath = "/superadmin/dashboard"; break;
            case "employee": dashboardPath = "/employee/dashboard"; break;
        }
        router.push(dashboardPath);
    }

  }, [currentUser, router, isMounted, pathname]); // Added pathname to dependency array


  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(guestUser);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background">
        Loading application...
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
                Rol: {currentUser.role}
              </p>
            </div>
          ) : (
             <div className="mt-1 text-center group-data-[collapsible=icon]:hidden">
               <p className="text-sm text-sidebar-foreground/80">
                Guest Access
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
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem disabled> {/* Disabled for mock */}
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled> {/* Disabled for mock */}
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarRail />
      <SidebarInset className="flex flex-col">
        <AppHeader currentUser={currentUser} handleLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

