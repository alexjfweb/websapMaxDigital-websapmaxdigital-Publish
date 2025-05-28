
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
  UserPlus
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context'; // Added

interface NavItem {
  href: string;
  labelKey: string; // Changed from label to labelKey
  icon: React.ElementType;
  allowedRoles: string[];
  subItems?: NavItem[];
  tooltipKey?: string; // Optional tooltipKey
}

const navItems: NavItem[] = [
  { href: '/menu', labelKey: 'nav.publicMenu', icon: Newspaper, allowedRoles: ['guest', 'employee', 'admin', 'superadmin'], tooltipKey: 'nav.publicMenu' },
  { href: '/login', labelKey: 'nav.login', icon: LogIn, allowedRoles: ['guest'], tooltipKey: 'nav.login' },
  { href: '/register', labelKey: 'nav.register', icon: UserPlus, allowedRoles: ['guest'], tooltipKey: 'nav.register' },
  { href: '/superadmin/dashboard', labelKey: 'nav.superAdminDashboard', icon: ShieldCheck, allowedRoles: ['superadmin'], tooltipKey: 'nav.superAdminDashboard' },
  { href: '/superadmin/users', labelKey: 'nav.userManagement', icon: Users, allowedRoles: ['superadmin'], tooltipKey: 'nav.userManagement' },
  { href: '/superadmin/backup', labelKey: 'nav.backup', icon: Server, allowedRoles: ['superadmin'], tooltipKey: 'nav.backup' },
  { href: '/superadmin/logs', labelKey: 'nav.logs', icon: History, allowedRoles: ['superadmin'], tooltipKey: 'nav.logs' },
  { href: '/admin/dashboard', labelKey: 'nav.adminDashboard', icon: LayoutDashboard, allowedRoles: ['admin', 'superadmin'], tooltipKey: 'nav.adminDashboard' },
  { href: '/admin/profile', labelKey: 'nav.restaurantProfile', icon: Settings, allowedRoles: ['admin', 'superadmin'], tooltipKey: 'nav.restaurantProfile' },
  { href: '/admin/dishes', labelKey: 'nav.dishManagement', icon: Utensils, allowedRoles: ['admin', 'superadmin'], tooltipKey: 'nav.dishManagement' },
  { href: '/admin/employees', labelKey: 'nav.employeeManagement', icon: UserCog, allowedRoles: ['admin', 'superadmin'], tooltipKey: 'nav.employeeManagement' },
  { href: '/admin/reservations', labelKey: 'nav.reservations', icon: CalendarCheck, allowedRoles: ['admin', 'superadmin'], tooltipKey: 'nav.reservations' },
  { href: '/admin/payments', labelKey: 'nav.paymentMethods', icon: CreditCard, allowedRoles: ['admin', 'superadmin'], tooltipKey: 'nav.paymentMethods' },
  { href: '/admin/share-menu', labelKey: 'nav.shareMenu', icon: Share2, allowedRoles: ['admin', 'superadmin'], tooltipKey: 'nav.shareMenu' },
  { href: '/employee/dashboard', labelKey: 'nav.employeeDashboard', icon: ClipboardList, allowedRoles: ['employee', 'admin', 'superadmin'], tooltipKey: 'nav.employeeDashboard' },
  { href: '/employee/orders', labelKey: 'nav.manageOrders', icon: ShoppingBag, allowedRoles: ['employee', 'admin', 'superadmin'], tooltipKey: 'nav.manageOrders' },
  { href: '/employee/reservations', labelKey: 'nav.manageReservations', icon: BookUser, allowedRoles: ['employee', 'admin', 'superadmin'], tooltipKey: 'nav.manageReservations' },
  { href: '/employee/promote', labelKey: 'nav.promoteMenu', icon: Megaphone, allowedRoles: ['employee', 'admin', 'superadmin'], tooltipKey: 'nav.promoteMenu' },
];

interface NavigationMenuProps {
  role: string;
}

export default function NavigationMenu({ role }: NavigationMenuProps) {
  const pathname = usePathname();
  const { t } = useLanguage(); // Added

  const renderNavItems = (items: NavItem[], isSubMenu = false) => {
    return items
      .filter(item => {
        if (role === 'guest') {
          return item.allowedRoles.includes('guest');
        }
        if (item.href === '/login' || item.href === '/register') {
          return false;
        }
        if (item.allowedRoles.includes(role)) return true;
        if (role === 'admin' && item.allowedRoles.includes('employee')) return true;
        if (role === 'superadmin' && (item.allowedRoles.includes('admin') || item.allowedRoles.includes('employee'))) return true;
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
