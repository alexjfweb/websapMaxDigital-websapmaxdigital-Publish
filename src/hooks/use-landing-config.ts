
"use client";

import { useState, useEffect } from 'react';
import type { LandingConfig } from '@/services/landing-config-service';
import { landingConfigService } from '@/services/landing-config-service';

export function useDefaultConfig(): LandingConfig {
    return landingConfigService.getDefaultConfig();
}

// Hook to be used only in client components that do not need to write data.
// It returns a static, default configuration to avoid Firestore calls for public visitors.
export function usePublicLandingConfig(): { config: LandingConfig; isLoading: boolean } {
  const [config, setConfig] = useState<LandingConfig>(() => landingConfigService.getDefaultConfig());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In this public version, we just confirm loading is done.
    // We could extend this to fetch from a CDN cache in the future.
    setIsLoading(false);
  }, []);

  return {
    config,
    isLoading,
  };
}
