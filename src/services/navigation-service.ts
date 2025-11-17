
import { getDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface NavItemConfig {
  id: string;
  label: string;
  tooltip: string;
  visible: boolean;
  order: number;
  roles: string[];
  href: string;
  icon?: string; // Icon ID (e.g., 'sa-dashboard')
}

export interface NavConfig {
  sidebarItems: NavItemConfig[];
  footerItems: NavItemConfig[];
}

const CONFIG_COLLECTION = 'configuration';
const NAVIGATION_DOC_ID = 'main-navigation';

// --- ITEMS BASE DEFINIDOS DIRECTAMENTE EN EL SERVICIO ---
const baseSidebarItems: any[] = [
  { id: 'sa-dashboard', href: '/superadmin/dashboard', labelKey: 'Panel', icon: 'ShieldCheck', allowedRoles: ['superadmin'], tooltipKey: 'Panel de superadministrador' },
  { id: 'sa-analytics', href: '/superadmin/analytics', labelKey: 'Analítica', icon: 'BarChart3', allowedRoles: ['superadmin'], tooltipKey: 'Analítica global' },
  { id: 'sa-companies', href: '/superadmin/companies', labelKey: 'Empresas', icon: 'Store', allowedRoles: ['superadmin'], tooltipKey: 'Gestión de empresas' },
  { id: 'sa-users', href: '/superadmin/users', labelKey: 'Usuarios', icon: 'Users', allowedRoles: ['superadmin'], tooltipKey: 'Gestión de usuarios' },
  { id: 'sa-plans', href: '/superadmin/subscription-plans', labelKey: 'Planes', icon: 'Gem', allowedRoles: ['superadmin'], tooltipKey: 'Gestionar planes' },
  { id: 'sa-landing-public', href: '/superadmin/landing-public', labelKey: 'Editor Landing', icon: 'Palette', allowedRoles: ['superadmin'], tooltipKey: 'Editar Landing Pública' },
  { id: 'sa-payment-methods', href: '/superadmin/payment-methods', labelKey: 'Configuración de Pagos', icon: 'CreditCard', allowedRoles: ['superadmin'], tooltipKey: 'Configurar pasarelas de pago' },
  { id: 'sa-pending-payments', href: '/superadmin/payments', labelKey: 'Pagos Pendientes', icon: 'CreditCard', allowedRoles: ['superadmin'], tooltipKey: 'Gestionar pagos pendientes' },
  { id: 'sa-reminders', href: '/superadmin/reminders', labelKey: 'Configuración IA', icon: 'BrainCircuit', allowedRoles: ['superadmin'], tooltipKey: 'Configurar Modelos de IA' },
  { id: 'sa-navigation', href: '/superadmin/navigation', labelKey: 'Navegación', icon: 'Navigation', allowedRoles: ['superadmin'], tooltipKey: 'Configurar navegación' },
  { id: 'sa-support', href: '/superadmin/support', labelKey: 'Soporte', icon: 'LifeBuoy', allowedRoles: ['superadmin'], tooltipKey: 'Gestión de Soporte y Mensajes' },
  { id: 'sa-audit', href: '/superadmin/audit', labelKey: 'Auditoría', icon: 'Archive', allowedRoles: ['superadmin'], tooltipKey: 'Registros de auditoría' },
  { id: 'sa-maintenance', href: '/superadmin/maintenance', labelKey: 'Mantenimiento', icon: 'Wrench', allowedRoles: ['superadmin'], tooltipKey: 'Mantenimiento' },
  { id: 'sa-database', href: '/superadmin/database', labelKey: 'Base de datos', icon: 'Database', allowedRoles: ['superadmin'], tooltipKey: 'Estado de la base de datos' },
  { id: 'sa-backup', href: '/superadmin/backup', labelKey: 'Respaldo', icon: 'Server', allowedRoles: ['superadmin'], tooltipKey: 'Respaldo' },
  { id: 'admin-dashboard', href: '/admin/dashboard', labelKey: 'Panel', icon: 'LayoutDashboard', allowedRoles: ['admin'], tooltipKey: 'Panel de administración' },
  { id: 'admin-profile', href: '/admin/profile', labelKey: 'Perfil', icon: 'Settings', allowedRoles: ['admin'], tooltipKey: 'Perfil del restaurante' },
  { id: 'admin-subscription', href: '/admin/subscription', labelKey: 'Suscripción', icon: 'Rocket', allowedRoles: ['admin'], tooltipKey: 'Gestionar Suscripción' },
  { id: 'admin-dishes', href: '/admin/dishes', labelKey: 'Platos', icon: 'Utensils', allowedRoles: ['admin'], tooltipKey: 'Gestión de platos' },
  { id: 'admin-suggestions', href: '/admin/suggestions', labelKey: 'Sugerencias IA', icon: 'BrainCircuit', allowedRoles: ['admin'], tooltipKey: 'Motor de Sugerencias' },
  { id: 'admin-employees', href: '/admin/employees', labelKey: 'Empleados', icon: 'UserCog', allowedRoles: ['admin'], tooltipKey: 'Gestión de empleados' },
  { id: 'admin-tables', href: '/admin/tables', labelKey: 'Mesas', icon: 'ClipboardList', allowedRoles: ['admin'], tooltipKey: 'Gestión de mesas' },
  { id: 'admin-reservations', href: '/admin/reservations', labelKey: 'Reservas', icon: 'CalendarCheck', allowedRoles: ['admin'], tooltipKey: 'Reservas' },
  { id: 'admin-orders', href: '/admin/orders', labelKey: 'Pedidos', icon: 'ShoppingBag', allowedRoles: ['admin'], tooltipKey: 'Gestión de pedidos' },
  { id: 'admin-share', href: '/admin/share-menu', labelKey: 'Compartir menú', icon: 'Share2', allowedRoles: ['admin'], tooltipKey: 'Compartir menú' },
  { id: 'admin-support', href: '/admin/support', labelKey: 'Soporte', icon: 'LifeBuoy', allowedRoles: ['admin'], tooltipKey: 'Contactar a Soporte' },
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


class NavigationService {

  private get navConfigDocRef() {
    const db = getDb();
    return doc(db, CONFIG_COLLECTION, NAVIGATION_DOC_ID);
  }

  async initializeDefaultConfig(): Promise<void> {
    const defaultSidebarConfig: NavItemConfig[] = baseSidebarItems.map((item, index) => ({
      id: item.id,
      label: item.labelKey,
      tooltip: item.tooltipKey || item.labelKey,
      visible: true,
      order: index,
      roles: item.allowedRoles,
      href: item.href,
      icon: item.id,
    }));

    const defaultFooterConfig: NavItemConfig[] = baseFooterItems.map((item, index) => ({
      id: item.id,
      label: item.labelKey,
      tooltip: item.tooltipKey || item.labelKey,
      visible: true,
      order: index,
      roles: item.allowedRoles,
      href: item.href,
      icon: item.id,
    }));
    
    const fullConfig: NavConfig = {
        sidebarItems: defaultSidebarConfig,
        footerItems: defaultFooterConfig,
    };

    try {
      await this.updateNavigationConfig(fullConfig);
    } catch (error) {
      console.error("Error initializing default navigation config:", error);
    }
  }

  async getNavigationConfig(): Promise<NavConfig> {
    try {
      const docSnap = await getDoc(this.navConfigDocRef);
      if (docSnap.exists()) {
        const storedConfig = docSnap.data();
        
        delete storedConfig.updatedAt;

        const mergedSidebar = this.mergeItems(storedConfig.sidebarItems || [], baseSidebarItems);
        const mergedFooter = this.mergeItems(storedConfig.footerItems || [], baseFooterItems);

        const sidebarItems = mergedSidebar.sort((a, b) => a.order - b.order);
        const footerItems = mergedFooter.sort((a, b) => a.order - b.order);
        
        return { sidebarItems, footerItems };
      } else {
        // Si no existe, lo inicializamos y lo devolvemos
        await this.initializeDefaultConfig();
        return this.getNavigationConfig(); // Volvemos a llamar para obtener el recién creado
      }
    } catch (error) {
      console.error("Error fetching navigation config:", error);
      throw error;
    }
  }

  private mergeItems(storedItems: NavItemConfig[], baseItems: any[]): NavItemConfig[] {
    const baseItemsMap = new Map(baseItems.map(item => [item.id, item]));
    const storedItemsMap = new Map(storedItems.map(item => [item.id, item]));
    const mergedItems: NavItemConfig[] = [];

    // Usar el orden de los items base como la fuente de verdad para el orden inicial
    baseItems.forEach(baseItem => {
        if(storedItemsMap.has(baseItem.id)) {
            const storedItem = storedItemsMap.get(baseItem.id)!;
             mergedItems.push({
                ...baseItem, // Propiedades base como href, roles, icon
                ...storedItem, // Sobrescribe con lo guardado en DB (label, visible, order, tooltip)
                label: storedItem.label || baseItem.labelKey, // Fallback por si el label está vacío
                tooltip: storedItem.tooltip || baseItem.tooltipKey || baseItem.labelKey,
             });
        } else {
             mergedItems.push({
                id: baseItem.id,
                label: baseItem.labelKey,
                tooltip: baseItem.tooltipKey || baseItem.labelKey,
                visible: true, // Por defecto visible
                order: mergedItems.length,
                roles: baseItem.allowedRoles,
                href: baseItem.href,
                icon: baseItem.id,
            });
        }
    });

    return mergedItems;
  }

  async updateNavigationConfig(config: NavConfig): Promise<void> {
    try {
      await setDoc(this.navConfigDocRef, {
        ...config,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating navigation config:", error);
      throw error;
    }
  }

  async checkAndInitializeDefaultConfig(): Promise<string> {
    const docSnap = await getDoc(this.navConfigDocRef);
    if (!docSnap.exists()) {
        console.log("No hay configuración de navegación, inicializando...");
        await this.initializeDefaultConfig();
        return "Configuración de navegación inicializada.";
    }
    return "La configuración de navegación ya existe.";
  }
}

export const navigationService = new NavigationService();
