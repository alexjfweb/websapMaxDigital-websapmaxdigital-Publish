
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
   * @returns A promise that resolves to an object containing sidebar and footer items.
   */
  async getNavigationConfig(): Promise<NavConfig> {
    const defaultConfig: NavConfig = { sidebarItems: [], footerItems: [] };
    try {
      const docSnap = await getDoc(this.navConfigDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Ensure data is sorted by order
        const sidebarItems = (data.sidebarItems || []).sort((a: NavItemConfig, b: NavItemConfig) => a.order - b.order);
        const footerItems = (data.footerItems || []).sort((a: NavItemConfig, b: NavItemConfig) => a.order - b.order);
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
