import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Permite que la compilación de producción se complete incluso si hay errores de tipo.
    // Es útil para el desarrollo rápido, pero se recomienda revisar los tipos antes de un despliegue final.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora los errores de ESLint durante la compilación.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Esta configuración no es necesaria por defecto en las versiones recientes de Next.js
    // y puede causar conflictos. Se ha eliminado para simplificar.
    // serverComponentsExternalPackages: ['@genkit-ai/googleai'],
    typedRoutes: true,
  },
};

export default nextConfig;
