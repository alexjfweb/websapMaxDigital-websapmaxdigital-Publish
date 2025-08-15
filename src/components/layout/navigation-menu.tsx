
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
import { useNavigationConfig } from '@/hooks/use-navigation-config';
import { Skeleton } from '@/components/ui/skeleton';
import type { NavItemConfig } from '@/services/navigation-service';

// Define the structure for the base navigation items
interface BaseNavItem {
  id: string;
  href: string;
  labelKey: string;
  icon: React.ElementType;
  allowedRoles: string[];
  tooltipKey?: string;
}

// Master list of all possible sidebar items
const baseSidebarItems: BaseNavItem[] = [
  // Superadmin
  { id: 'sa-dashboard', href: '/superadmin/dashboard', labelKey: 'Panel', icon: ShieldCheck, allowedRoles: ['superadmin'], tooltipKey: 'Panel de superadministrador' },
  { id: 'sa-analytics', href: '/superadmin/analytics', labelKey: 'Analítica', icon: BarChart3, allowedRoles: ['superadmin'], tooltipKey: 'Analítica global' },
  { id: 'sa-companies', href: '/superadmin/companies', labelKey: 'Empresas', icon: Store, allowedRoles: ['superadmin'], tooltipKey: 'Gestión de empresas' },
  { id: 'sa-users', href: '/superadmin/users', labelKey: 'Usuarios', icon: Users, allowedRoles: ['superadmin'], tooltipKey: 'Gestión de usuarios' },
  { id: 'sa-plans', href: '/superadmin/subscription-plans', labelKey: 'Planes', icon: Gem, allowedRoles: ['superadmin'], tooltipKey: 'Gestionar planes' },
  { id: 'sa-pending-payments', href: '/superadmin/payments', labelKey: 'Pagos Pendientes', icon: CreditCard, allowedRoles: ['superadmin'], tooltipKey: 'Gestionar pagos pendientes' },
  { id: 'sa-navigation', href: '/superadmin/navigation', labelKey: 'Navegación', icon: Navigation, allowedRoles: ['superadmin'], tooltipKey: 'Configurar navegación' },
  { id: 'sa-support', href: '/superadmin/support', labelKey: 'Soporte', icon: LifeBuoy, allowedRoles: ['superadmin'], tooltipKey: 'Gestión de Soporte' },
  { id: 'sa-audit', href: '/superadmin/audit', labelKey: 'Auditoría', icon: Archive, allowedRoles: ['superadmin'], tooltipKey: 'Registros de auditoría' },
  { id: 'sa-maintenance', href: '/superadmin/maintenance', labelKey: 'Mantenimiento', icon: Wrench, allowedRoles: ['superadmin'], tooltipKey: 'Mantenimiento' },
  { id: 'sa-database', href: '/superadmin/database', labelKey: 'Base de datos', icon: Database, allowedRoles: ['superadmin'], tooltipKey: 'Estado de la base de datos' },
  { id: 'sa-backup', href: '/superadmin/backup', labelKey: 'Respaldo', icon: Server, allowedRoles: ['superadmin'], tooltipKey: 'Respaldo' },
  // Admin
  { id: 'admin-dashboard', href: '/admin/dashboard', labelKey: 'Panel', icon: LayoutDashboard, allowedRoles: ['admin'], tooltipKey: 'Panel de administración' },
  { id: 'admin-profile', href: '/admin/profile', labelKey: 'Perfil', icon: Settings, allowedRoles: ['admin'], tooltipKey: 'Perfil del restaurante' },
  { id: 'admin-subscription', href: '/admin/subscription', labelKey: 'Suscripción', icon: Rocket, allowedRoles: ['admin'], tooltipKey: 'Gestionar Suscripción' },
  { id: 'admin-dishes', href: '/admin/dishes', labelKey: 'Platos', icon: Utensils, allowedRoles: ['admin'], tooltipKey: 'Gestión de platos' },
  { id: 'admin-employees', href: '/admin/employees', labelKey: 'Empleados', icon: UserCog, allowedRoles: ['admin'], tooltipKey: 'Gestión de empleados' },
  { id: 'admin-tables', href: '/admin/tables', labelKey: 'Mesas', icon: ClipboardList, allowedRoles: ['admin'], tooltipKey: 'Gestión de mesas' },
  { id: 'admin-reservations', href: '/admin/reservations', labelKey: 'Reservas', icon: CalendarCheck, allowedRoles: ['admin'], tooltipKey: 'Reservas' },
  { id: 'admin-orders', href: '/admin/orders', labelKey: 'Pedidos', icon: ShoppingBag, allowedRoles: ['admin'], tooltipKey: 'Gestión de pedidos' },
  { id: 'admin-share', href: '/admin/share-menu', labelKey: 'Compartir menú', icon: Share2, allowedRoles: ['admin'], tooltipKey: 'Compartir menú' },
  // Employee
  { id: 'emp-dashboard', href: '/employee/dashboard', labelKey: 'Panel', icon: ClipboardList, allowedRoles: ['employee'], tooltipKey: 'Panel de empleado' },
  { id: 'emp-orders', href: '/employee/orders', labelKey: 'Pedidos', icon: ShoppingBag, allowedRoles: ['employee'], tooltipKey: 'Gestionar pedidos' },
  { id: 'emp-tables', href: '/employee/tables', labelKey: 'Mesas', icon: ClipboardList, allowedRoles: ['employee'], tooltipKey: 'Ver mesas' },
  { id: 'emp-reservations', href: '/employee/reservations', labelKey: 'Reservas', icon: BookUser, allowedRoles: ['employee'], tooltipKey: 'Gestionar reservas' },
  { id: 'emp-promote', href: '/employee/promote', labelKey: 'Promocionar', icon: Megaphone, allowedRoles: ['employee'], tooltipKey: 'Promocionar menú' },
];

// Master list of all possible footer items
const baseFooterItems: BaseNavItem[] = [
  { id: 'footer-dashboard', href: '/admin/dashboard', labelKey: 'Panel', icon: LayoutDashboard, allowedRoles: ['admin', 'employee'], tooltipKey: 'Panel' },
  { id: 'footer-orders', href: '/admin/orders', labelKey: 'Pedidos', icon: ShoppingBag, allowedRoles: ['admin', 'employee'], tooltipKey: 'Pedidos' },
  { id: 'footer-reservations', href: '/admin/reservations', labelKey: 'Reservas', icon: BookUser, allowedRoles: ['admin', 'employee'], tooltipKey: 'Reservas' },
  { id: 'footer-tables', href: '/admin/tables', labelKey: 'Mesas', icon: ClipboardList, allowedRoles: ['admin', 'employee'], tooltipKey: 'Mesas' },
  { id: 'footer-share', href: '/admin/share-menu', labelKey: 'Compartir', icon: Share2, allowedRoles: ['admin', 'employee'], tooltipKey: 'Compartir Menú' },
];

// Create a single, efficient map to look up icon components by their ID
const iconMap = [...baseSidebarItems, ...baseFooterItems].reduce((map, item) => {
  map[item.id] = item.icon;
  return map;
}, {} as Record<string, React.ElementType>);

interface NavigationMenuProps {
  role: string;
}

export default function NavigationMenu({ role }: NavigationMenuProps) {
  const pathname = usePathname();
  const { navConfig, isLoading, isError } = useNavigationConfig(baseSidebarItems, baseFooterItems);

  const renderNavItems = (items: NavItemConfig[]) => {
    if (isLoading) {
      return Array.from({ length: 8 }).map((_, i) => (
         <div key={i} className="flex items-center gap-3 p-2 ml-1">
            <Skeleton className="h-5 w-5 rounded-md"/>
            <Skeleton className="h-4 w-32"/>
        </div>
      ));
    }
    
    if (isError) {
      return <p className="p-2 text-xs text-destructive">Error al cargar menú.</p>;
    }

    const userRole = role?.toLowerCase() || 'guest';

    return items
      .filter(item => item.visible && item.roles.includes(userRole))
      .sort((a, b) => a.order - b.order)
      .map((item) => {
        const IconComponent = iconMap[item.icon as string] || LayoutDashboard;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.tooltip}>
              <Link href={item.href}>
                <IconComponent />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      });
  };

  return <SidebarMenu>{renderNavItems(navConfig.sidebarItems)}</SidebarMenu>;
}
