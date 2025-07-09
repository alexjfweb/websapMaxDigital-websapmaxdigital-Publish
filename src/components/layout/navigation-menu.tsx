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
  Megaphone,
  LogIn,
  UserPlus,
  Store,
  BarChart3,
  Wrench,
  Database,
  Gem,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  allowedRoles: string[];
  subItems?: NavItem[];
  tooltipKey?: string;
}

const navItems: NavItem[] = [
  // Public/Guest routes
  { href: '/menu', labelKey: 'nav.publicMenu', icon: Newspaper, allowedRoles: ['guest'], tooltipKey: 'nav.publicMenu' },
  { href: '/login', labelKey: 'nav.login', icon: LogIn, allowedRoles: ['guest'], tooltipKey: 'nav.login' },
  { href: '/register', labelKey: 'nav.register', icon: UserPlus, allowedRoles: ['guest'], tooltipKey: 'nav.register' },

  // Superadmin routes
  { href: '/superadmin/dashboard', labelKey: 'nav.superAdminDashboard', icon: ShieldCheck, allowedRoles: ['superadmin'], tooltipKey: 'nav.superAdminDashboard' },
  { href: '/superadmin/analytics', labelKey: 'nav.globalAnalytics', icon: BarChart3, allowedRoles: ['superadmin'], tooltipKey: 'nav.globalAnalytics' },
  { href: '/superadmin/companies', labelKey: 'nav.companyManagement', icon: Store, allowedRoles: ['superadmin'], tooltipKey: 'nav.companyManagement' },
  { href: '/superadmin/subscriptions', labelKey: 'nav.subscriptionManagement', icon: Gem, allowedRoles: ['superadmin'], tooltipKey: 'nav.subscriptionManagement' },
  { href: '/superadmin/users', labelKey: 'nav.userManagement', icon: Users, allowedRoles: ['superadmin'], tooltipKey: 'nav.userManagement' },
  { href: '/superadmin/maintenance', labelKey: 'nav.maintenance', icon: Wrench, allowedRoles: ['superadmin'], tooltipKey: 'nav.maintenance' },
  { href: '/superadmin/database', labelKey: 'nav.databaseStatus', icon: Database, allowedRoles: ['superadmin'], tooltipKey: 'nav.databaseStatus' },
  { href: '/superadmin/backup', labelKey: 'nav.backup', icon: Server, allowedRoles: ['superadmin'], tooltipKey: 'nav.backup' },
  { href: '/superadmin/logs', labelKey: 'nav.logs', icon: History, allowedRoles: ['superadmin'], tooltipKey: 'nav.logs' },

  // Admin routes
  { href: '/admin/dashboard', labelKey: 'nav.adminDashboard', icon: LayoutDashboard, allowedRoles: ['admin'], tooltipKey: 'nav.adminDashboard' },
  { href: '/admin/profile', labelKey: 'nav.restaurantProfile', icon: Settings, allowedRoles: ['admin'], tooltipKey: 'nav.restaurantProfile' },
  { href: '/admin/dishes', labelKey: 'nav.dishManagement', icon: Utensils, allowedRoles: ['admin'], tooltipKey: 'nav.dishManagement' },
  { href: '/admin/employees', labelKey: 'nav.employeeManagement', icon: UserCog, allowedRoles: ['admin'], tooltipKey: 'nav.employeeManagement' },
  { href: '/admin/reservations', labelKey: 'nav.reservations', icon: CalendarCheck, allowedRoles: ['admin'], tooltipKey: 'nav.reservations' },
  { href: '/admin/payments', labelKey: 'nav.paymentMethods', icon: CreditCard, allowedRoles: ['admin'], tooltipKey: 'nav.paymentMethods' },
  { href: '/admin/share-menu', labelKey: 'nav.shareMenu', icon: Share2, allowedRoles: ['admin'], tooltipKey: 'nav.shareMenu' },

  // Employee routes
  { href: '/employee/dashboard', labelKey: 'nav.employeeDashboard', icon: ClipboardList, allowedRoles: ['employee'], tooltipKey: 'nav.employeeDashboard' },
  { href: '/employee/orders', labelKey: 'nav.manageOrders', icon: ShoppingBag, allowedRoles: ['employee'], tooltipKey: 'nav.manageOrders' },
  { href: '/employee/reservations', labelKey: 'nav.manageReservations', icon: BookUser, allowedRoles: ['employee'], tooltipKey: 'nav.manageReservations' },
  { href: '/employee/promote', labelKey: 'nav.promoteMenu', icon: Megaphone, allowedRoles: ['employee'], tooltipKey: 'nav.promoteMenu' },
];

interface NavigationMenuProps {
  role: string;
}

export default function NavigationMenu({ role }: NavigationMenuProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const renderNavItems = (items: NavItem[], isSubMenu = false) => {
    return items
      .filter(item => {
        // Superadmin sees only superadmin items
        if (role === 'superadmin') {
            return item.allowedRoles.includes('superadmin');
        }
        // Admin sees only admin items
        if (role === 'admin') {
            return item.allowedRoles.includes('admin');
        }
        // Employee sees only employee items
        if (role === 'employee') {
            return item.allowedRoles.includes('employee');
        }
        // Guest sees only guest items and not logged-in items
        if (role === 'guest') {
            return item.allowedRoles.includes('guest');
        }
        return false;
      })
      .map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const translatedLabel = t(item.labelKey);
        const translatedTooltip = item.tooltipKey ? t(item.tooltipKey) : translatedLabel;
        
        if (isSubMenu) {
          return (
            <SidebarMenuSubItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuSubButton isActive={isActive}>
                  <span>{translatedLabel}</span>
                </SidebarMenuSubButton>
              </Link>
            </SidebarMenuSubItem>
          );
        }

        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive} tooltip={translatedTooltip}>
                <Icon />
                <span>{translatedLabel}</span>
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
