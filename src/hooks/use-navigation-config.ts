
"use client";

import useSWR from 'swr';
import { navigationService, NavItemConfig, NavConfig } from '@/services/navigation-service';

// Key for SWR to cache the navigation config
const SWR_KEY = 'navigation-config';

/**
 * Hook to get and manage the application's navigation configuration.
 * It fetches the config from Firestore, provides loading/error states,
 * and includes a function to update the configuration.
 * 
 * @param baseSidebarItems The default sidebar navigation structure.
 * @param baseFooterItems The default footer navigation structure.
 * @returns An object with the navigation config, loading state, error state, and an update function.
 */
export function useNavigationConfig(baseSidebarItems: any[] = [], baseFooterItems: any[] = []) {
  // Fetcher function that SWR will use, passing base items to it.
  const fetcher = (key: string): Promise<NavConfig> => {
      if (key === SWR_KEY) {
          return navigationService.getNavigationConfig({ sidebarItems: baseSidebarItems, footerItems: baseFooterItems });
      }
      throw new Error('Invalid key for navigation config fetcher');
  };
  
  const { data, error, isLoading, mutate } = useSWR(SWR_KEY, fetcher, {
    revalidateOnFocus: false, // Avoid re-fetching on window focus
    onSuccess: (data) => {
        if (!data || data.sidebarItems.length === 0) {
            // If DB is empty, initialize it with the base items
            console.log("No navigation config found, initializing with defaults.");
            navigationService.initializeDefaultConfig(baseSidebarItems, baseFooterItems);
        }
    }
  });

  /**
   * Updates the navigation configuration.
   * Performs an optimistic update for a better user experience,
   * then revalidates with the server.
   * @param newConfig The new object containing sidebar and footer items.
   */
  const updateConfig = async (newConfig: NavConfig) => {
    // Optimistic update
    mutate(newConfig, false);

    try {
      await navigationService.updateNavigationConfig(newConfig);
      // Trigger a revalidation to get the final state from the server
      mutate();
    } catch (error) {
      // If the update fails, roll back the optimistic update
      mutate(); 
      console.error("Failed to update navigation config:", error);
      throw error; // Re-throw to be caught by the component
    }
  };

  const defaultConfig: NavConfig = { 
    sidebarItems: baseSidebarItems.map((item, index) => ({ ...item, order: index, id: item.id || `temp-${index}` })), 
    footerItems: baseFooterItems.map((item, index) => ({ ...item, order: index, id: item.id || `temp-footer-${index}` })) 
  };

  return {
    navConfig: data || defaultConfig,
    isLoading,
    isError: !!error,
    updateConfig,
  };
}
