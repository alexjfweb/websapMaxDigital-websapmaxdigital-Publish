
"use client";

import useSWR, { mutate } from 'swr';
import { navigationService, NavConfig, NavItemConfig } from '@/services/navigation-service';
import { useState, useEffect } from 'react';

const SWR_KEY = 'navigation-config';

// Define los items base fuera del componente para que sean constantes
const baseSidebarItems: any[] = [
  { id: 'sa-dashboard', href: '/superadmin/dashboard', labelKey: 'Panel', icon: 'ShieldCheck', allowedRoles: ['superadmin'], tooltipKey: 'Panel de superadministrador' },
  { id: 'sa-analytics', href: '/superadmin/analytics', labelKey: 'Analítica', icon: 'BarChart3', allowedRoles: ['superadmin'], tooltipKey: 'Analítica global' },
  { id: 'sa-companies', href: '/superadmin/companies', labelKey: 'Empresas', icon: 'Store', allowedRoles: ['superadmin'], tooltipKey: 'Gestión de empresas' },
  { id: 'sa-users', href: '/superadmin/users', labelKey: 'Usuarios', icon: 'Users', allowedRoles: ['superadmin'], tooltipKey: 'Gestión de usuarios' },
  { id: 'sa-plans', href: '/superadmin/subscription-plans', labelKey: 'Planes', icon: 'Gem', allowedRoles: ['superadmin'], tooltipKey: 'Gestionar planes' },
  { id: 'sa-landing-public', href: '/superadmin/landing-public', labelKey: 'Editor Landing', icon: 'Palette', allowedRoles: ['superadmin'], tooltipKey: 'Editar Landing Pública' },
  { id: 'sa-payment-methods', href: '/superadmin/payment-methods', labelKey: 'Configuración de Pagos', icon: 'CreditCard', allowedRoles: ['superadmin'], tooltipKey: 'Configurar pasarelas de pago' },
  { id: 'sa-pending-payments', href: '/superadmin/payments', labelKey: 'Pagos Pendientes', icon: 'CreditCard', allowedRoles: ['superadmin'], tooltipKey: 'Gestionar pagos pendientes' },
  { id: 'sa-reminders', href: '/superadmin/reminders', labelKey: 'Recordatorios', icon: 'BellRing', allowedRoles: ['superadmin'], tooltipKey: 'Recordatorios de pago' },
  { id: 'sa-navigation', href: '/superadmin/navigation', labelKey: 'Navegación', icon: 'Navigation', allowedRoles: ['superadmin'], tooltipKey: 'Configurar navegación' },
  { id: 'sa-support', href: '/superadmin/support', labelKey: 'Soporte', icon: 'LifeBuoy', allowedRoles: ['superadmin'], tooltipKey: 'Gestión de Soporte' },
  { id: 'sa-audit', href: '/superadmin/audit', labelKey: 'Auditoría', icon: 'Archive', allowedRoles: ['superadmin'], tooltipKey: 'Registros de auditoría' },
  { id: 'sa-maintenance', href: '/superadmin/maintenance', labelKey: 'Mantenimiento', icon: 'Wrench', allowedRoles: ['superadmin'], tooltipKey: 'Mantenimiento' },
  { id: 'sa-database', href: '/superadmin/database', labelKey: 'Base de datos', icon: 'Database', allowedRoles: ['superadmin'], tooltipKey: 'Estado de la base de datos' },
  { id: 'sa-backup', href: '/superadmin/backup', labelKey: 'Respaldo', icon: 'Server', allowedRoles: ['superadmin'], tooltipKey: 'Respaldo' },
  { id: 'admin-dashboard', href: '/admin/dashboard', labelKey: 'Panel', icon: 'LayoutDashboard', allowedRoles: ['admin'], tooltipKey: 'Panel de administración' },
  { id: 'admin-profile', href: '/admin/profile', labelKey: 'Perfil', icon: 'Settings', allowedRoles: ['admin'], tooltipKey: 'Perfil del restaurante' },
  { id: 'admin-subscription', href: '/admin/subscription', labelKey: 'Suscripción', icon: 'Rocket', allowedRoles: ['admin'], tooltipKey: 'Gestionar Suscripción' },
  { id: 'admin-dishes', href: '/admin/dishes', labelKey: 'Platos', icon: 'Utensils', allowedRoles: ['admin'], tooltipKey: 'Gestión de platos' },
  { id: 'admin-employees', href: '/admin/employees', labelKey: 'Empleados', icon: 'UserCog', allowedRoles: ['admin'], tooltipKey: 'Gestión de empleados' },
  { id: 'admin-tables', href: '/admin/tables', labelKey: 'Mesas', icon: 'ClipboardList', allowedRoles: ['admin'], tooltipKey: 'Gestión de mesas' },
  { id: 'admin-reservations', href: '/admin/reservations', labelKey: 'Reservas', icon: 'CalendarCheck', allowedRoles: ['admin'], tooltipKey: 'Reservas' },
  { id: 'admin-orders', href: '/admin/orders', labelKey: 'Pedidos', icon: 'ShoppingBag', allowedRoles: ['admin'], tooltipKey: 'Gestión de pedidos' },
  { id: 'admin-share', href: '/admin/share-menu', labelKey: 'Compartir menú', icon: 'Share2', allowedRoles: ['admin'], tooltipKey: 'Compartir menú' },
  { id: 'emp-dashboard', href: '/employee/dashboard', labelKey: 'Panel', icon: 'ClipboardList', allowedRoles: ['employee'], tooltipKey: 'Panel de empleado' },
  { id: 'emp-orders', href: '/employee/orders', labelKey: 'Pedidos', icon: 'ShoppingBag', allowedRoles: ['employee'], tooltipKey: 'Gestionar pedidos' },
  { id: 'emp-tables', href: '/employee/tables', labelKey: 'Mesas', icon: 'ClipboardList', allowedRoles: ['employee'], tooltipKey: 'Ver mesas' },
  { id: 'emp-reservations', href: '/employee/reservations', labelKey: 'Reservas', icon: 'BookUser', allowedRoles: ['employee'], tooltipKey: 'Gestionar reservas' },
  { id: 'emp-promote', href: '/employee/promote', labelKey: 'Promocionar', icon: 'Megaphone', allowedRoles: ['employee'], tooltipKey: 'Promocionar menú' },
];
const baseFooterItems: any[] = [
    { id: 'footer-dashboard', href: '/admin/dashboard', labelKey: 'Panel', icon: 'LayoutDashboard', allowedRoles: ['admin', 'employee'], tooltipKey: 'Panel' },
    { id: 'footer-orders', href: '/admin/orders', labelKey: 'Pedidos', icon: 'ShoppingBag', allowedRoles: ['admin', 'employee'], tooltipKey: 'Pedidos' },
    { id: 'footer-reservations', href: '/admin/reservations', labelKey: 'Reservas', icon: 'BookUser', allowedRoles: ['admin', 'employee'], tooltipKey: 'Reservas' },
    { id: 'footer-tables', href: '/admin/tables', labelKey: 'Mesas', icon: 'ClipboardList', allowedRoles: ['admin', 'employee'], tooltipKey: 'Mesas' },
    { id: 'footer-share', href: '/admin/share-menu', labelKey: 'Compartir', icon: 'Share2', allowedRoles: ['admin', 'employee'], tooltipKey: 'Compartir Menú' },
];

const getDefaultNavConfig = (): NavConfig => ({
  sidebarItems: [],
  footerItems: [],
});

export function useNavigationConfig() {
  const [isSaving, setIsSaving] = useState(false);
  
  const fetcher = async (): Promise<NavConfig> => {
    let config = await navigationService.getNavigationConfig({ sidebarItems: baseSidebarItems, footerItems: baseFooterItems });
    if (!config || !config.sidebarItems || config.sidebarItems.length === 0) {
      console.log("No navigation config found, initializing with defaults.");
      await navigationService.initializeDefaultConfig(baseSidebarItems, baseFooterItems);
      config = await navigationService.getNavigationConfig({ sidebarItems: baseSidebarItems, footerItems: baseFooterItems });
    }
    return config;
  };

  const { data: navConfig, error, isLoading, mutate } = useSWR(SWR_KEY, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const saveConfig = async (configToSave: NavConfig) => {
    setIsSaving(true);
    try {
      await navigationService.updateNavigationConfig(configToSave);
      // Actualiza el cache local de SWR con los datos guardados sin necesidad de re-validar
      mutate(configToSave, false); 
    } catch (e) {
        console.error("Failed to save navigation config:", e);
        throw e;
    } finally {
        setIsSaving(false);
    }
  };
  
  return {
    navConfig: navConfig ?? getDefaultNavConfig(),
    isLoading,
    isError: !!error,
    saveConfig,
    isSaving,
  };
}
