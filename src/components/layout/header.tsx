"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Bell, UserCircle, Settings, LogOut, Menu as MenuIcon, LogIn as LogInIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import type { User } from '@/types';

interface AppHeaderProps {
  currentUser: User;
  handleLogout: () => void;
}

export default function AppHeader({ currentUser, handleLogout }: AppHeaderProps) {
  const { isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 shadow-sm">
      {isMobile && <SidebarTrigger asChild><Button variant="ghost" size="icon"><MenuIcon /></Button></SidebarTrigger>}
      <div className="flex-1">
        {/* Optional: Search bar or other header elements can go here */}
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
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
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
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
        ) : (
          <Link href="/login" passHref>
            <Button variant="outline">
              <LogInIcon className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
