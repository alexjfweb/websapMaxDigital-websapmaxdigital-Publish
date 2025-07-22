import { landingConfigService } from '@/services/landing-config-service';

async function initializeLandingConfig() {
  try {
    console.log('🔧 Inicializando configuración de landing page...');
    
    // Verificar si ya existe configuración
    const existingConfig = await landingConfigService.getLandingConfig();
    
    if (existingConfig) {
      console.log('✅ La configuración ya existe, verificando secciones...');
      
      // Verificar si tiene las secciones por defecto
      const hasDefaultSections = existingConfig.sections.some(section => 
        section.title === 'Características Principales' || 
        section.title === 'Nuestros Servicios'
      );
      
      if (!hasDefaultSections) {
        console.log('⚠️ Configuración existe pero faltan secciones por defecto, actualizando...');
        const defaultConfig = landingConfigService.getDefaultConfig();
        await landingConfigService.updateLandingConfig(
          { 
            id: existingConfig.id, 
            sections: defaultConfig.sections 
          },
          'system',
          'system@websapmax.com'
        );
        console.log('✅ Secciones por defecto agregadas');
      } else {
        console.log('✅ Las secciones por defecto ya están presentes');
      }
    } else {
      console.log('📝 Creando nueva configuración con secciones por defecto...');
      const defaultConfig = landingConfigService.getDefaultConfig();
      await landingConfigService.createLandingConfig(
        defaultConfig,
        'system',
        'system@websapmax.com'
      );
      console.log('✅ Configuración creada exitosamente');
    }
    
    console.log('🎉 Inicialización completada');
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeLandingConfig();
}

export { initializeLandingConfig }; 