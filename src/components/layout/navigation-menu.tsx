"use client";

import * as React from 'react';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Home,
  ShoppingBag,
  Users,
  Settings,
  ClipboardList,
  BookUser,
  ShieldCheck,
  LayoutDashboard,
  Utensils,
  Newspaper,
  Share2,
  UserCog,
  FileText,
  Server,
  History,
  CreditCard,
  CalendarCheck,
  Megaphone
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  allowedRoles: string[];
  subItems?: NavItem[];
  tooltip?: string;
}

const navItems: NavItem[] = [
  { href: '/menu', label: 'Public Menu', icon: Newspaper, allowedRoles: ['guest', 'employee', 'admin', 'superadmin'], tooltip: 'View Menu' },
  { href: '/login', label: 'Login', icon: Home, allowedRoles: ['guest'], tooltip: 'Login' },
  { href: '/register', label: 'Register', icon: UserCog, allowedRoles: ['guest'], tooltip: 'Register' },
  
  // SuperAdmin Routes
  { href: '/superadmin/dashboard', label: 'SA Dashboard', icon: ShieldCheck, allowedRoles: ['superadmin'], tooltip: 'Super Admin Dashboard' },
  { href: '/superadmin/users', label: 'User Management', icon: Users, allowedRoles: ['superadmin'], tooltip: 'Manage Users' },
  { href: '/superadmin/backup', label: 'Backup', icon: Server, allowedRoles: ['superadmin'], tooltip: 'System Backup' },
  { href: '/superadmin/logs', label: 'Logs', icon: History, allowedRoles: ['superadmin'], tooltip: 'View Logs' },

  // Admin Routes
  { href: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, allowedRoles: ['admin'], tooltip: 'Admin Dashboard' },
  { href: '/admin/profile', label: 'Restaurant Profile', icon: Settings, allowedRoles: ['admin'], tooltip: 'Manage Profile' },
  { href: '/admin/dishes', label: 'Dish Management', icon: Utensils, allowedRoles: ['admin'], tooltip: 'Manage Dishes' },
  { href: '/admin/employees', label: 'Employee Management', icon: UserCog, allowedRoles: ['admin'], tooltip: 'Manage Employees' },
  { href: '/admin/reservations', label: 'Reservations', icon: CalendarCheck, allowedRoles: ['admin'], tooltip: 'Manage Reservations' },
  { href: '/admin/payments', label: 'Payment Methods', icon: CreditCard, allowedRoles: ['admin'], tooltip: 'Payment Settings' },
  { href: '/admin/share-menu', label: 'Share Menu', icon: Share2, allowedRoles: ['admin'], tooltip: 'Share Menu' },
  
  // Employee Routes
  { href: '/employee/dashboard', label: 'Employee Dashboard', icon: ClipboardList, allowedRoles: ['employee'], tooltip: 'Employee Dashboard' },
  { href: '/employee/orders', label: 'Manage Orders', icon: ShoppingBag, allowedRoles: ['employee'], tooltip: 'Manage Orders' },
  { href: '/employee/reservations', label: 'Manage Reservations', icon: BookUser, allowedRoles: ['employee'], tooltip: 'Manage Reservations' },
  { href: '/employee/promote', label: 'Promote Menu', icon: Megaphone, allowedRoles: ['employee'], tooltip: 'Promote Menu' },
];

interface NavigationMenuProps {
  role: string; // e.g., 'guest', 'admin', 'employee', 'superadmin'
}

export default function NavigationMenu({ role }: NavigationMenuProps) {
  const pathname = usePathname();

  const renderNavItems = (items: NavItem[], isSubMenu = false) => {
    return items
      .filter(item => item.allowedRoles.includes(role) || item.allowedRoles.includes('guest')) // Show guest items too
      .map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        
        if (isSubMenu) {
          return (
            <SidebarMenuSubItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuSubButton isActive={isActive}>
                  {/* <Icon className="h-4 w-4 mr-2" /> */}
                  <span>{item.label}</span>
                </SidebarMenuSubButton>
              </Link>
            </SidebarMenuSubItem>
          );
        }

        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive} tooltip={item.tooltip || item.label}>
                <Icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
            {item.subItems && item.subItems.length > 0 && (
              <SidebarMenuSub>
                {renderNavItems(item.subItems, true)}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        );
      });
  };

  return <SidebarMenu>{renderNavItems(navItems)}</SidebarMenu>;
}
