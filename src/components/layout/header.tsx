"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Bell, UserCircle, Settings, LogOut, Menu as MenuIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';

// Mock user for demonstration - in a real app, this would come from auth context
const mockUser = {
  name: 'Admin User',
  email: 'admin@websapmax.com',
  avatarUrl: 'https://placehold.co/100x100.png',
};

export default function AppHeader() {
  const { isMobile } = useSidebar();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 shadow-sm">
      {isMobile && <SidebarTrigger asChild><Button variant="ghost" size="icon"><MenuIcon /></Button></SidebarTrigger>}
      <div className="flex-1">
        {/* Optional: Search bar or other header elements can go here */}
        {/* <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background" />
        </div> */}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
         {/* User Menu already present in sidebar footer, conditionally render or simplify for header */}
      </div>
    </header>
  );
}
