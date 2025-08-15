
import { db } from '@/lib/firebase';
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

class NavigationService {

  private get navConfigDocRef() {
    return doc(db, CONFIG_COLLECTION, NAVIGATION_DOC_ID);
  }

  async initializeDefaultConfig(baseSidebarItems: any[], baseFooterItems: any[]): Promise<void> {
    const defaultSidebarConfig: NavItemConfig[] = baseSidebarItems.map((item, index) => ({
      id: item.id,
      label: item.labelKey,
      tooltip: item.tooltipKey || item.labelKey,
      visible: true,
      order: index,
      roles: item.allowedRoles,
      href: item.href,
      icon: item.id, // Storing the item's own ID as the icon identifier
    }));

    const defaultFooterConfig: NavItemConfig[] = baseFooterItems.map((item, index) => ({
      id: item.id,
      label: item.labelKey,
      tooltip: item.tooltipKey || item.labelKey,
      visible: true,
      order: index,
      roles: item.allowedRoles,
      href: item.href,
      icon: item.id, // Storing the item's own ID as the icon identifier
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

  async getNavigationConfig(baseItems: { sidebarItems: any[], footerItems: any[] } = { sidebarItems: [], footerItems: [] }): Promise<NavConfig> {
    try {
      const docSnap = await getDoc(this.navConfigDocRef);
      if (docSnap.exists()) {
        const storedConfig = docSnap.data();
        
        delete storedConfig.updatedAt;

        const mergedSidebar = this.mergeItems(storedConfig.sidebarItems || [], baseItems.sidebarItems);
        const mergedFooter = this.mergeItems(storedConfig.footerItems || [], baseItems.footerItems);

        const sidebarItems = mergedSidebar.sort((a, b) => a.order - b.order);
        const footerItems = mergedFooter.sort((a, b) => a.order - b.order);
        
        return { sidebarItems, footerItems };
      } else {
        return { sidebarItems: [], footerItems: [] };
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

    storedItems.forEach(storedItem => {
      const baseItem = baseItemsMap.get(storedItem.id);
      if (baseItem) {
        mergedItems.push({
          ...storedItem,
          label: baseItem.labelKey,
          tooltip: baseItem.tooltipKey || baseItem.labelKey,
          icon: baseItem.id, // Always use the ID for the icon
          roles: baseItem.allowedRoles,
          href: baseItem.href,
        });
      }
    });

    baseItems.forEach(baseItem => {
      if (!storedItemsMap.has(baseItem.id)) {
        mergedItems.push({
          id: baseItem.id,
          label: baseItem.labelKey,
          tooltip: baseItem.tooltipKey || baseItem.labelKey,
          visible: true,
          order: mergedItems.length,
          roles: baseItem.allowedRoles,
          href: baseItem.href,
          icon: baseItem.id, // Always use the ID for the icon
        });
      }
    });

    return mergedItems.map((item, index) => ({ ...item, order: index }));
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
}

export const navigationService = new NavigationService();
