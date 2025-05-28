import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import AppHeader from '@/components/layout/header';
import NavigationMenu from '@/components/layout/navigation-menu';
import { Button } from '@/components/ui/button';
import { Home, LogOut, Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock user for demonstration
const mockUser = {
  name: 'Admin User',
  email: 'admin@websapmax.com',
  avatarUrl: 'https://placehold.co/100x100.png',
  role: 'admin', // Possible roles: 'superadmin', 'admin', 'employee', 'guest'
};


export default function AppLayout({ children }: { children: React.ReactNode }) {
  // For this scaffold, we'll pass the mock user's role to the NavigationMenu
  // In a real app, this would come from an auth context or session.
  const userRole = mockUser.role;

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
        </SidebarHeader>
        <SidebarContent className="flex-grow">
          <NavigationMenu role={userRole} />
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="w-full justify-start gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} data-ai-hint="user avatar" />
                      <AvatarFallback>{mockUser.name.substring(0,1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="group-data-[collapsible=icon]:hidden flex flex-col items-start">
                      <span className="text-sm font-medium">{mockUser.name}</span>
                      <span className="text-xs text-muted-foreground">{mockUser.email}</span>
                    </div>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2 ml-2" side="top" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
