// src/services/landing-config-service.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auditService } from './audit-service';

export interface LandingSEO {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface LandingSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'contact' | 'about' | 'services';
  title: string;
  subtitle: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'none';
  // Campos SEO específicos para la sección
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  // Subsecciones (para features o servicios)
  subsections?: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
  }[];
  // Tipo de media
  mediaType?: 'none' | 'image' | 'video';
  mediaUrl?: string;
  mediaPosition?: 'left' | 'right' | 'top';
}

export interface LandingConfig {
  id?: string;
  title: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroButtonUrl: string;
  heroBackgroundColor: string;
  heroTextColor: string;
  heroButtonColor: string;
  heroAnimation: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'none';
  sections: LandingSection[];
  seo: LandingSEO;
}

const CONFIG_ID = "main"; // Usamos un ID único para el documento de config

class LandingConfigService {
  private readonly COLLECTION_NAME = 'landing_configs';
  
  /**
   * Proporciona la configuración por defecto para la landing page.
   * @returns Un objeto LandingConfig con valores predeterminados.
   */
  getDefaultConfig(): LandingConfig {
    return {
      title: 'WebSapMax Digital',
      description: 'Tu solución digital para restaurantes',
      heroTitle: 'Transforma tu Restaurante',
      heroSubtitle: 'Con nuestro menú digital interactivo y sistema de gestión integral.',
      heroButtonText: 'Ver Demo',
      heroButtonUrl: '#menu',
      heroBackgroundColor: '#FFF2E6',
      heroTextColor: '#333333',
      heroButtonColor: '#FF4500',
      heroAnimation: 'fadeIn',
      sections: [
        {
          id: 'features-1',
          type: 'features',
          title: 'Características Principales',
          subtitle: 'Todo lo que necesitas para digitalizar tu negocio',
          content: 'Desde menús interactivos hasta gestión de pedidos en tiempo real.',
          backgroundColor: '#FFFFFF',
          textColor: '#333333',
          buttonColor: '#FF4500',
          buttonText: 'Conoce más',
          buttonUrl: '#features',
          order: 1,
          isActive: true,
          animation: 'slideUp',
          subsections: []
        },
        {
          id: 'services-1',
          type: 'services',
          title: 'Nuestros Servicios',
          subtitle: 'Soluciones a tu medida',
          content: 'Ofrecemos personalización completa para que tu menú digital refleje la identidad de tu marca.',
          backgroundColor: '#FFF2E6',
          textColor: '#333333',
          buttonColor: '#FF4500',
          buttonText: 'Ver Servicios',
          buttonUrl: '#services',
          order: 2,
          isActive: true,
          animation: 'fadeIn',
          subsections: []
        }
      ],
      seo: {
        title: 'WebSapMax Digital | Menús Digitales para Restaurantes',
        description: 'Digitaliza tu restaurante con WebSapMax. Ofrecemos menús QR interactivos, gestión de pedidos, reservas y más. ¡Atrae más clientes y optimiza tu operación!',
        keywords: ['menu digital', 'restaurante', 'QR', 'gestión de pedidos', 'reservas online'],
        ogTitle: 'WebSapMax Digital: El Futuro de tu Restaurante',
        ogDescription: 'Descubre cómo nuestro sistema de menú digital puede transformar la experiencia de tus clientes.',
        ogImage: 'https://placehold.co/1200x630.png',
      },
    };
  }

  /**
   * Obtiene la configuración de la landing page desde Firestore.
   * Si no existe, crea una con los valores por defecto.
   * @returns El objeto de configuración de la landing page.
   */
  async getLandingConfig(): Promise<LandingConfig> {
    const docRef = doc(db, this.COLLECTION_NAME, CONFIG_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Combina los datos de la DB con los por defecto para asegurar que no falten campos
      const dbData = docSnap.data();
      return {
        ...this.getDefaultConfig(),
        ...dbData,
        seo: { ...this.getDefaultConfig().seo, ...dbData.seo },
        sections: Array.isArray(dbData.sections) ? dbData.sections : this.getDefaultConfig().sections,
      };
    } else {
      console.log("No se encontró configuración de landing. Creando una por defecto.");
      const defaultConfig = this.getDefaultConfig();
      await setDoc(docRef, { ...defaultConfig, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return defaultConfig;
    }
  }

  /**
   * Actualiza la configuración de la landing page en Firestore.
   * @param configData - Un objeto parcial con los campos a actualizar.
   * @param userId - ID del usuario que realiza la acción.
   * @param userEmail - Email del usuario.
   */
  async updateLandingConfig(configData: Partial<LandingConfig>, userId: string, userEmail: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, CONFIG_ID);
    
    // Obtener datos actuales para auditoría
    const currentConfig = await this.getLandingConfig();
    
    const updatePayload = {
      ...configData,
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, updatePayload, { merge: true });

    // Registrar en auditoría
    await auditService.log({
      entity: 'landingPlans', // Usamos 'landingPlans' para agrupar configs generales de la landing
      entityId: CONFIG_ID,
      action: 'updated',
      performedBy: { uid: userId, email: userEmail },
      previousData: currentConfig,
      newData: { ...currentConfig, ...configData },
    });
  }

  /**
   * Limpia planes duplicados (ejemplo de una acción de mantenimiento).
   * Esta función es un placeholder y puede ser adaptada.
   */
  async cleanupDuplicatePlans() {
    // Lógica para limpiar datos si fuese necesario.
    console.log("Función de limpieza de planes ejecutada.");
  }
}

export const landingConfigService = new LandingConfigService();
