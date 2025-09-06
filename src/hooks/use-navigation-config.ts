
"use client";

import useSWR, { mutate } from 'swr';
import { navigationService, NavItemConfig, NavConfig } from '@/services/navigation-service';
import { useState, useEffect } from 'react';

const SWR_KEY = 'navigation-config';

export function useNavigationConfig(baseSidebarItems: any[] = [], baseFooterItems: any[] = []) {
  const [navConfig, setNavConfig] = useState<NavConfig>({ sidebarItems: [], footerItems: [] });

  const fetcher = async (): Promise<NavConfig> => {
      const config = await navigationService.getNavigationConfig({ sidebarItems: baseSidebarItems, footerItems: baseFooterItems });
      if (!config.sidebarItems || config.sidebarItems.length === 0) {
          console.log("No navigation config found, initializing with defaults.");
          await navigationService.initializeDefaultConfig(baseSidebarItems, baseFooterItems);
          return await navigationService.getNavigationConfig({ sidebarItems: baseSidebarItems, footerItems: baseFooterItems });
      }
      return config;
  };

  const { data, error, isLoading, isValidating } = useSWR(SWR_KEY, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (data) {
      setNavConfig(data);
    }
  }, [data]);

  const saveConfig = async () => {
    await navigationService.updateNavigationConfig(navConfig);
    mutate(SWR_KEY, navConfig, false);
  };
  
  return {
    navConfig,
    setNavConfig,
    isLoading: isLoading || isValidating,
    isError: !!error,
    saveConfig,
  };
}
