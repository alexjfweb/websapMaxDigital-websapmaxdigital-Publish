
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
  Server,
  History,
  CalendarCheck,
  Megaphone,
  LogIn,
  UserPlus,
  Store,
  BarChart3,
  Wrench,
  Database,
  Gem,
  BellRing,
  Palette,
  Archive,
  CreditCard,
  Rocket,
  Navigation
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useNavigationConfig } from '@/hooks/use-navigation-config';
import { Skeleton } from '@/components/ui/skeleton';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  allowedRoles: string[];
  subItems?: NavItem[];
  tooltipKey?: string;
  id: string; // ID único para la configuración
}

// Configuración base de la navegación. Esta será la referencia si no hay config en DB.
const baseNavItems: NavItem[] = [
  // Rutas públicas/invitado
  { id: 'login', href: '/login', labelKey: 'Iniciar sesión', icon: LogIn, allowedRoles: ['guest'], tooltipKey: 'Iniciar sesión' },
  { id: 'register', href: '/register', labelKey: 'Registrarse', icon: UserPlus, allowedRoles: ['guest'], tooltipKey: 'Crear cuenta' },

  // Superadmin
  { id: 'sa-dashboard', href: '/superadmin/dashboard', labelKey: 'Panel', icon: ShieldCheck, allowedRoles: ['superadmin'], tooltipKey: 'Panel de superadministrador' },
  { id: 'sa-analytics', href: '/superadmin/analytics', labelKey: 'Analítica', icon: BarChart3, allowedRoles: ['superadmin'], tooltipKey: 'Analítica global' },
  { id: 'sa-companies', href: '/superadmin/companies', labelKey: 'Empresas', icon: Store, allowedRoles: ['superadmin'], tooltipKey: 'Gestión de empresas' },
  { id: 'sa-plans', href: '/superadmin/subscription-plans', labelKey: 'Planes', icon: Gem, allowedRoles: ['superadmin'], tooltipKey: 'Gestionar planes' },
  { id: 'sa-payments', href: '/superadmin/payment-methods', labelKey: 'Pagos', icon: CreditCard, allowedRoles: ['superadmin'], tooltipKey: 'Configurar métodos de pago' },
  { id: 'sa-navigation', href: '/superadmin/navigation', labelKey: 'Navegación', icon: Navigation, allowedRoles: ['superadmin'], tooltipKey: 'Configurar navegación' },
  { id: 'sa-reminders', href: '/superadmin/reminders', labelKey: 'Recordatorios', icon: BellRing, allowedRoles: ['superadmin'], tooltipKey: 'Recordatorios de pago' },
  { id: 'sa-users', href: '/superadmin/users', labelKey: 'Usuarios', icon: Users, allowedRoles: ['superadmin'], tooltipKey: 'Gestión de usuarios' },
  { id: 'sa-audit', href: '/superadmin/audit', labelKey: 'Auditoría', icon: Archive, allowedRoles: ['superadmin'], tooltipKey: 'Registros de auditoría' },
  { id: 'sa-maintenance', href: '/superadmin/maintenance', labelKey: 'Mantenimiento', icon: Wrench, allowedRoles: ['superadmin'], tooltipKey: 'Mantenimiento' },
  { id: 'sa-database', href: '/superadmin/database', labelKey: 'Base de datos', icon: Database, allowedRoles: ['superadmin'], tooltipKey: 'Estado de la base de datos' },
  { id: 'sa-backup', href: '/superadmin/backup', labelKey: 'Respaldo', icon: Server, allowedRoles: ['superadmin'], tooltipKey: 'Respaldo' },
  { id: 'sa-landing-public', href: '/superadmin/landing-public', labelKey: 'Landing', icon: Palette, allowedRoles: ['superadmin'], tooltipKey: 'Gestionar landing pública' },

  // Admin
  { id: 'admin-dashboard', href: '/admin/dashboard', labelKey: 'Panel', icon: LayoutDashboard, allowedRoles: ['admin'], tooltipKey: 'Panel de administración' },
  { id: 'admin-profile', href: '/admin/profile', labelKey: 'Perfil', icon: Settings, allowedRoles: ['admin'], tooltipKey: 'Perfil del restaurante' },
  { id: 'admin-subscription', href: '/admin/subscription', labelKey: 'Suscripción', icon: Rocket, allowedRoles: ['admin'], tooltipKey: 'Gestionar Suscripción' },
  { id: 'admin-dishes', href: '/admin/dishes', labelKey: 'Platos', icon: Utensils, allowedRoles: ['admin'], tooltipKey: 'Gestión de platos' },
  { id: 'admin-employees', href: '/admin/employees', labelKey: 'Empleados', icon: UserCog, allowedRoles: ['admin'], tooltipKey: 'Gestión de empleados' },
  { id: 'admin-tables', href: '/admin/tables', labelKey: 'Mesas', icon: ClipboardList, allowedRoles: ['admin'], tooltipKey: 'Gestión de mesas' },
  { id: 'admin-reservations', href: '/admin/reservations', labelKey: 'Reservas', icon: CalendarCheck, allowedRoles: ['admin'], tooltipKey: 'Reservas' },
  { id: 'admin-orders', href: '/admin/orders', labelKey: 'Pedidos', icon: ShoppingBag, allowedRoles: ['admin'], tooltipKey: 'Gestión de pedidos' },
  { id: 'admin-customization', href: '/admin/dashboard/personalizacion', labelKey: 'Personalización', icon: Palette, allowedRoles: ['admin'], tooltipKey: 'Personalizar menú' },
  { id: 'admin-share', href: '/admin/share-menu', labelKey: 'Compartir menú', icon: Share2, allowedRoles: ['admin'], tooltipKey: 'Compartir menú' },

  // Empleado
  { id: 'emp-dashboard', href: '/employee/dashboard', labelKey: 'Panel', icon: ClipboardList, allowedRoles: ['employee'], tooltipKey: 'Panel de empleado' },
  { id: 'emp-orders', href: '/employee/orders', labelKey: 'Pedidos', icon: ShoppingBag, allowedRoles: ['employee'], tooltipKey: 'Gestionar pedidos' },
  { id: 'emp-tables', href: '/employee/tables', labelKey: 'Mesas', icon: ClipboardList, allowedRoles: ['employee'], tooltipKey: 'Ver mesas' },
  { id: 'emp-reservations', href: '/employee/reservations', labelKey: 'Reservas', icon: BookUser, allowedRoles: ['employee'], tooltipKey: 'Gestionar reservas' },
  { id: 'emp-promote', href: '/employee/promote', labelKey: 'Promocionar', icon: Megaphone, allowedRoles: ['employee'], tooltipKey: 'Promocionar menú' },
];

interface NavigationMenuProps {
  role: string;
}

export default function NavigationMenu({ role }: NavigationMenuProps) {
  const pathname = usePathname();
  const { navConfig, isLoading, isError } = useNavigationConfig(baseNavItems);

  const renderNavItems = (items: NavItem[], isSubMenu = false) => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
         <div key={i} className="flex items-center gap-2 p-2">
            <Skeleton className="h-6 w-6 rounded-md"/>
            <Skeleton className="h-4 w-32"/>
        </div>
      ));
    }
    
    if(isError) {
        return <p className="text-xs text-destructive p-2">Error al cargar el menú.</p>;
    }

    return items
      .filter(item => {
        const userRole = role ? role.toLowerCase() : 'guest';
        // Buscamos el item en la configuración traída de la DB
        const configItem = navConfig.find(c => c.id === item.id);
        // Si no se encuentra en la config, no se muestra.
        if (!configItem) return false;
        // Se muestra si el rol está permitido Y está visible en la config.
        return configItem.roles.includes(userRole) && configItem.visible;
      })
      .map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const configItem = navConfig.find(c => c.id === item.id);
        const translatedLabel = configItem?.label || item.labelKey;
        const translatedTooltip = configItem?.tooltip || translatedLabel;
        
        const content = item.subItems && item.subItems.length > 0 ? (
          <SidebarMenuSub>
            {renderNavItems(item.subItems, true)}
          </SidebarMenuSub>
        ) : null;

        if (isSubMenu) {
          return (
            <SidebarMenuSubItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuSubButton asChild isActive={isActive}>
                  <a>{translatedLabel}</a>
                </SidebarMenuSubButton>
              </Link>
            </SidebarMenuSubItem>
          );
        }

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={translatedTooltip}>
              <Link href={item.href}>
                <Icon />
                <span>{translatedLabel}</span>
              </Link>
            </SidebarMenuButton>
            {content}
          </SidebarMenuItem>
        );
      });
  };

  return <SidebarMenu>{renderNavItems(baseNavItems)}</SidebarMenu>;
}
