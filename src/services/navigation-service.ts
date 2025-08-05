
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface NavItemConfig {
  id: string;          // Unique identifier (e.g., 'sa-dashboard')
  label: string;       // The text displayed in the menu
  tooltip: string;     // Text for the tooltip in collapsed mode
  visible: boolean;    // Whether the item is rendered
  order: number;       // The display order
  roles: string[];     // Roles that can see this item (e.g., ['superadmin'])
  href: string;        // The link URL
}

const CONFIG_COLLECTION = 'configuration';
const NAVIGATION_DOC_ID = 'main-navigation';

class NavigationService {

  private get navConfigDocRef() {
    return doc(db, CONFIG_COLLECTION, NAVIGATION_DOC_ID);
  }

  /**
   * Initializes the default navigation config in Firestore if it doesn't exist.
   * @param baseNavItems The default navigation items from the source code.
   */
  async initializeDefaultConfig(baseNavItems: any[]): Promise<void> {
    const defaultConfig: NavItemConfig[] = baseNavItems.map((item, index) => ({
      id: item.id,
      label: item.labelKey,
      tooltip: item.tooltipKey || item.labelKey,
      visible: true,
      order: index,
      roles: item.allowedRoles,
      href: item.href,
    }));

    try {
      await this.updateNavigationConfig(defaultConfig);
      console.log("Default navigation configuration initialized successfully.");
    } catch (error) {
      console.error("Error initializing default navigation config:", error);
    }
  }

  /**
   * Fetches the navigation configuration from Firestore.
   * If it doesn't exist, it creates and returns a default configuration.
   * @returns A promise that resolves to an array of NavItemConfig.
   */
  async getNavigationConfig(): Promise<NavItemConfig[]> {
    try {
      const docSnap = await getDoc(this.navConfigDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Ensure data is sorted by order
        return data.items.sort((a: NavItemConfig, b: NavItemConfig) => a.order - b.order);
      } else {
        // If no config exists, return an empty array. The hook will initialize it.
        return [];
      }
    } catch (error) {
      console.error("Error fetching navigation config:", error);
      throw error;
    }
  }

  /**
   * Updates the entire navigation configuration in Firestore.
   * @param config The new array of navigation items.
   */
  async updateNavigationConfig(config: NavItemConfig[]): Promise<void> {
    try {
      await setDoc(this.navConfigDocRef, {
        items: config,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating navigation config:", error);
      throw error;
    }
  }
}

export const navigationService = new NavigationService();
