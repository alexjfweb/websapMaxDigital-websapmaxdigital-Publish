
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
  icon?: string; // Icon name as string
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

  /**
   * Initializes the default navigation config in Firestore if it doesn't exist.
   * @param baseSidebarItems The default sidebar navigation items.
   * @param baseFooterItems The default footer navigation items.
   */
  async initializeDefaultConfig(baseSidebarItems: any[], baseFooterItems: any[]): Promise<void> {
    const defaultSidebarConfig: NavItemConfig[] = baseSidebarItems.map((item, index) => ({
      id: item.id,
      label: item.labelKey,
      tooltip: item.tooltipKey || item.labelKey,
      visible: true,
      order: index,
      roles: item.allowedRoles,
      href: item.href,
      icon: item.icon.displayName || item.icon.name, // Storing icon name
    }));

    const defaultFooterConfig: NavItemConfig[] = baseFooterItems.map((item, index) => ({
      id: item.id,
      label: item.labelKey,
      tooltip: item.tooltipKey || item.labelKey,
      visible: true,
      order: index,
      roles: item.allowedRoles,
      href: item.href,
      icon: item.icon.displayName || item.icon.name,
    }));
    
    const fullConfig: NavConfig = {
        sidebarItems: defaultSidebarConfig,
        footerItems: defaultFooterConfig,
    };

    try {
      await this.updateNavigationConfig(fullConfig);
      console.log("Default navigation configuration initialized successfully.");
    } catch (error) {
      console.error("Error initializing default navigation config:", error);
    }
  }

  /**
   * Fetches the navigation configuration from Firestore.
   * If it doesn't exist, it returns a default (empty) configuration object.
   * It also merges new items from the base config if they are missing in the stored config.
   * @returns A promise that resolves to an object containing sidebar and footer items.
   */
  async getNavigationConfig(baseItems: { sidebarItems: any[], footerItems: any[] } = { sidebarItems: [], footerItems: [] }): Promise<NavConfig> {
    const defaultConfig: NavConfig = { sidebarItems: [], footerItems: [] };
    try {
      const docSnap = await getDoc(this.navConfigDocRef);
      if (docSnap.exists()) {
        const storedConfig = docSnap.data() as NavConfig;
        
        // Merge stored config with base config to add new items
        const mergedSidebar = this.mergeItems(storedConfig.sidebarItems || [], baseItems.sidebarItems);
        const mergedFooter = this.mergeItems(storedConfig.footerItems || [], baseItems.footerItems);

        // Sort items by order property
        const sidebarItems = mergedSidebar.sort((a, b) => a.order - b.order);
        const footerItems = mergedFooter.sort((a, b) => a.order - b.order);
        
        return { sidebarItems, footerItems };
      } else {
        // If no config exists, return an empty config. The hook will initialize it.
        return defaultConfig;
      }
    } catch (error) {
      console.error("Error fetching navigation config:", error);
      throw error;
    }
  }

  /**
   * Merges stored navigation items with base items, adding new ones from base
   * and ensuring that labels for existing items are updated if they changed in the code.
   */
  private mergeItems(storedItems: NavItemConfig[], baseItems: any[]): NavItemConfig[] {
    const baseItemsMap = new Map(baseItems.map(item => [item.id, item]));
    const storedItemsMap = new Map(storedItems.map(item => [item.id, item]));

    const mergedItems: NavItemConfig[] = [];

    // First, iterate over stored items to maintain their order and saved properties (like `visible`)
    storedItems.forEach(storedItem => {
        const baseItem = baseItemsMap.get(storedItem.id);
        if (baseItem) {
            // If item exists in both, use stored item but update label/tooltip from base if needed.
            mergedItems.push({
                ...storedItem,
                label: baseItem.labelKey, // Always take the latest label from code
                tooltip: baseItem.tooltipKey || baseItem.labelKey, // And the latest tooltip
                icon: baseItem.icon.displayName || baseItem.icon.name, // And icon
                roles: baseItem.allowedRoles, // And roles
                href: baseItem.href, // and href
            });
        }
        // If an item is in stored but not in base, it's considered "orphaned" and we drop it.
    });

    // Second, add any new items from baseItems that are not in storedItems
    baseItems.forEach(baseItem => {
        if (!storedItemsMap.has(baseItem.id)) {
            mergedItems.push({
                id: baseItem.id,
                label: baseItem.labelKey,
                tooltip: baseItem.tooltipKey || baseItem.labelKey,
                visible: true, // Default to visible
                order: mergedItems.length, // Add to the end
                roles: baseItem.allowedRoles,
                href: baseItem.href,
                icon: baseItem.icon.displayName || baseItem.icon.name,
            });
        }
    });

    // Recalculate order to ensure it's sequential
    return mergedItems.map((item, index) => ({ ...item, order: index }));
  }


  /**
   * Updates the entire navigation configuration in Firestore.
   * @param config The new configuration object containing sidebar and footer items.
   */
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
