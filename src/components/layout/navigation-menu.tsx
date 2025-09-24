"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  ShoppingBag, Users, Settings, ClipboardList, BookUser, ShieldCheck, LayoutDashboard, Utensils,
  Share2, UserCog, Server, History, CalendarCheck, Megaphone, Store, BarChart3, Wrench, Database,
  Gem, BellRing, Palette, Archive, CreditCard, Rocket, Navigation, LifeBuoy
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { NavItemConfig } from '@/services/navigation-service';

const iconMap: { [key: string]: React.ElementType } = {
  'sa-dashboard': ShieldCheck,
  'sa-analytics': BarChart3,
  'sa-companies': Store,
  'sa-users': Users,
  'sa-plans': Gem,
  'sa-landing-public': Palette,
  'sa-payment-methods': CreditCard,
  'sa-pending-payments': CreditCard,
  'sa-reminders': BellRing,
  'sa-navigation': Navigation,
  'sa-support': LifeBuoy,
  'sa-audit': Archive,
  'sa-maintenance': Wrench,
  'sa-database': Database,
  'sa-backup': Server,
  'admin-dashboard': LayoutDashboard,
  'admin-profile': Settings,
  'admin-subscription': Rocket,
  'admin-dishes': Utensils,
  'admin-employees': UserCog,
  'admin-tables': ClipboardList,
  'admin-reservations': CalendarCheck,
  'admin-orders': ShoppingBag,
  'admin-share': Share2,
  'admin-support': LifeBuoy,
  'emp-dashboard': ClipboardList,
  'emp-orders': ShoppingBag,
  'emp-tables': ClipboardList,
  'emp-reservations': BookUser,
  'emp-promote': Megaphone,
  'footer-dashboard': LayoutDashboard,
  'footer-orders': ShoppingBag,
  'footer-reservations': BookUser,
  'footer-tables': ClipboardList,
  'footer-share': Share2,
};

interface NavigationMenuProps {
  role: string;
  items: NavItemConfig[];
  isLoading: boolean;
  onLinkClick?: () => void;
}

export default function NavigationMenu({ role, items, isLoading, onLinkClick }: NavigationMenuProps) {
  const pathname = usePathname();

  if (isLoading) {
    return (
        <SidebarMenu>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 ml-1">
                    <Skeleton className="h-5 w-5 rounded-md"/>
                    <Skeleton className="h-4 w-32"/>
                </div>
            ))}
        </SidebarMenu>
    );
  }
    
  if (!items || items.length === 0) {
      return <p className="p-2 text-xs text-destructive">Error al cargar menú.</p>;
  }

  const userRole = role?.toLowerCase() || 'guest';
  const visibleItems = items
      .filter(item => item.visible && item.roles.includes(userRole))
      .sort((a, b) => a.order - b.order);

  return (
    <SidebarMenu>
        {visibleItems.map((item) => {
            const IconComponent = iconMap[item.icon as string] || LayoutDashboard;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
                <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.tooltip} onClick={onLinkClick}>
                    <Link href={item.href}>
                        <IconComponent />
                        <span>{item.label}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        })}
    </SidebarMenu>
  );
}
