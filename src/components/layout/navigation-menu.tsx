
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
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  allowedRoles: string[];
  subItems?: NavItem[];
  tooltipKey?: string;
}

const navItems: NavItem[] = [
  // Rutas públicas/invitado
  { href: '/login', labelKey: 'Iniciar sesión', icon: LogIn, allowedRoles: ['guest'], tooltipKey: 'Iniciar sesión' },
  { href: '/register', labelKey: 'Registrarse', icon: UserPlus, allowedRoles: ['guest'], tooltipKey: 'Crear cuenta' },

  // Superadmin
  { href: '/superadmin/dashboard', labelKey: 'Panel', icon: ShieldCheck, allowedRoles: ['superadmin'], tooltipKey: 'Panel de superadministrador' },
  { href: '/superadmin/analytics', labelKey: 'Analítica', icon: BarChart3, allowedRoles: ['superadmin'], tooltipKey: 'Analítica global' },
  { href: '/superadmin/companies', labelKey: 'Empresas', icon: Store, allowedRoles: ['superadmin'], tooltipKey: 'Gestión de empresas' },
  { href: '/superadmin/subscription-plans', labelKey: 'Planes de Suscripción', icon: Gem, allowedRoles: ['superadmin'], tooltipKey: 'Gestionar planes de suscripción' },
  { href: '/superadmin/payment-methods', labelKey: 'Métodos de Pago', icon: CreditCard, allowedRoles: ['superadmin'], tooltipKey: 'Configurar métodos de pago' },
  { href: '/superadmin/reminders', labelKey: 'Recordatorios', icon: BellRing, allowedRoles: ['superadmin'], tooltipKey: 'Recordatorios de pago' },
  { href: '/superadmin/users', labelKey: 'Usuarios', icon: Users, allowedRoles: ['superadmin'], tooltipKey: 'Gestión de usuarios' },
  { href: '/superadmin/audit', labelKey: 'Auditoría', icon: Archive, allowedRoles: ['superadmin'], tooltipKey: 'Registros de auditoría' },
  { href: '/superadmin/maintenance', labelKey: 'Mantenimiento', icon: Wrench, allowedRoles: ['superadmin'], tooltipKey: 'Mantenimiento' },
  { href: '/superadmin/database', labelKey: 'Base de datos', icon: Database, allowedRoles: ['superadmin'], tooltipKey: 'Estado de la base de datos' },
  { href: '/superadmin/backup', labelKey: 'Respaldo', icon: Server, allowedRoles: ['superadmin'], tooltipKey: 'Respaldo' },
  { href: '/superadmin/logs', labelKey: 'Registros', icon: History, allowedRoles: ['superadmin'], tooltipKey: 'Registros' },
  { href: '/superadmin/landing-public', labelKey: 'Landing pública', icon: Palette, allowedRoles: ['superadmin'], tooltipKey: 'Gestionar landing pública' },

  // Admin
  { href: '/admin/dashboard', labelKey: 'Panel', icon: LayoutDashboard, allowedRoles: ['admin'], tooltipKey: 'Panel de administración' },
  { href: '/admin/profile', labelKey: 'Perfil', icon: Settings, allowedRoles: ['admin'], tooltipKey: 'Perfil del restaurante' },
  { href: '/admin/dishes', labelKey: 'Platos', icon: Utensils, allowedRoles: ['admin'], tooltipKey: 'Gestión de platos' },
  { href: '/admin/employees', labelKey: 'Empleados', icon: UserCog, allowedRoles: ['admin'], tooltipKey: 'Gestión de empleados' },
  { href: '/admin/tables', labelKey: 'Mesas', icon: ClipboardList, allowedRoles: ['admin'], tooltipKey: 'Gestión de mesas' },
  { href: '/admin/reservations', labelKey: 'Reservas', icon: CalendarCheck, allowedRoles: ['admin'], tooltipKey: 'Reservas' },
  { href: '/admin/orders', labelKey: 'Pedidos', icon: ShoppingBag, allowedRoles: ['admin'], tooltipKey: 'Gestión de pedidos' },
  { href: '/admin/dashboard/personalizacion', labelKey: 'Personalización', icon: Palette, allowedRoles: ['admin'], tooltipKey: 'Personalizar menú' },
  { href: '/admin/share-menu', labelKey: 'Compartir menú', icon: Share2, allowedRoles: ['admin'], tooltipKey: 'Compartir menú' },

  // Empleado
  { href: '/employee/dashboard', labelKey: 'Panel', icon: ClipboardList, allowedRoles: ['employee'], tooltipKey: 'Panel de empleado' },
  { href: '/employee/orders', labelKey: 'Pedidos', icon: ShoppingBag, allowedRoles: ['employee'], tooltipKey: 'Gestionar pedidos' },
  { href: '/employee/tables', labelKey: 'Mesas', icon: ClipboardList, allowedRoles: ['employee'], tooltipKey: 'Ver mesas' },
  { href: '/employee/reservations', labelKey: 'Reservas', icon: BookUser, allowedRoles: ['employee'], tooltipKey: 'Gestionar reservas' },
  { href: '/employee/promote', labelKey: 'Promocionar', icon: Megaphone, allowedRoles: ['employee'], tooltipKey: 'Promocionar menú' },
];

interface NavigationMenuProps {
  role: string;
}

export default function NavigationMenu({ role }: NavigationMenuProps) {
  const pathname = usePathname();

  const renderNavItems = (items: NavItem[], isSubMenu = false) => {
    return items
      .filter(item => {
        const userRole = role ? role.toLowerCase() : 'guest';
        return item.allowedRoles.includes(userRole);
      })
      .map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const translatedLabel = item.labelKey;
        const translatedTooltip = item.tooltipKey ? item.tooltipKey : translatedLabel;
        
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

  return <SidebarMenu>{renderNavItems(navItems)}</SidebarMenu>;
}
