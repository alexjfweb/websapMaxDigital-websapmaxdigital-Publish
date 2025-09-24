
"use client";

import useSWR from 'swr';
import { navigationService, NavConfig } from '@/services/navigation-service';
import { useState } from 'react';

const SWR_KEY = 'navigation-config';

// El fetcher ahora es una llamada simple al servicio, que ya contiene toda la lógica.
const fetcher = async (): Promise<NavConfig> => {
  return navigationService.getNavigationConfig();
};

const getDefaultNavConfig = (): NavConfig => ({
  sidebarItems: [],
  footerItems: [],
});

export function useNavigationConfig() {
  const [isSaving, setIsSaving] = useState(false);
  
  const { data, error, isLoading, mutate } = useSWR(SWR_KEY, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // Cache por 1 minuto
  });

  const saveConfig = async (newConfig: NavConfig) => {
    setIsSaving(true);
    try {
      await navigationService.updateNavigationConfig(newConfig);
      // Actualizar el cache local de SWR inmediatamente para reflejar los cambios en la UI
      mutate(newConfig, false); 
    } catch (e) {
        console.error("Failed to save navigation config:", e);
        throw e;
    } finally {
        setIsSaving(false);
    }
  };
  
  return {
    // Si los datos están cargando o hay un error, devuelve una config vacía para evitar errores de renderizado.
    // El estado `isLoading` se usará en el componente para mostrar un skeleton.
    navConfig: data || getDefaultNavConfig(),
    // El componente que usa el hook puede decidir qué hacer con este estado
    setNavConfig: mutate, // Re-utilizamos mutate para actualizar el estado local
    isLoading: isLoading && !data && !error,
    isError: !!error,
    saveConfig,
    isSaving,
  };
}
