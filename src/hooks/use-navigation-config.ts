
"use client";

import useSWR, { mutate } from 'swr';
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
  const fetcher = async (key: string): Promise<NavConfig> => {
      if (key === SWR_KEY) {
          const config = await navigationService.getNavigationConfig({ sidebarItems: baseSidebarItems, footerItems: baseFooterItems });
          // CORRECCIÓN: Si la configuración está vacía, la inicializa en la BD y la devuelve
          // para que no se muestre vacía la primera vez.
          if (config.sidebarItems.length === 0) {
              console.log("No navigation config found, initializing with defaults.");
              await navigationService.initializeDefaultConfig(baseSidebarItems, baseFooterItems);
              // Vuelve a buscar la configuración recién creada
              return await navigationService.getNavigationConfig({ sidebarItems: baseSidebarItems, footerItems: baseFooterItems });
          }
          return config;
      }
      throw new Error('Invalid key for navigation config fetcher');
  };
  
  const { data, error, isLoading } = useSWR(SWR_KEY, fetcher, {
    revalidateOnFocus: false, // Avoid re-fetching on window focus
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
    sidebarItems: baseSidebarItems.map((item, index) => ({ ...item, order: index, id: item.id || `temp-${index}`, visible: true, label: item.labelKey, tooltip: item.tooltipKey || item.labelKey, href: item.href, roles: item.allowedRoles })), 
    footerItems: baseFooterItems.map((item, index) => ({ ...item, order: index, id: item.id || `temp-footer-${index}`, visible: true, label: item.labelKey, tooltip: item.tooltipKey || item.labelKey, href: item.href, roles: item.allowedRoles })) 
  };

  return {
    navConfig: data || defaultConfig,
    isLoading,
    isError: !!error,
    updateConfig,
  };
}
