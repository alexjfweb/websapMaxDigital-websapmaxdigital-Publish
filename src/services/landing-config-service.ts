import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Tipos para la configuración de la landing
export interface LandingSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'contact' | 'about' | 'services';
  title: string;
  subtitle?: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonText: string;
  buttonUrl?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  animation: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'none';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  mediaType?: 'image' | 'video' | null;
  mediaUrl?: string;
  mediaPosition?: 'left' | 'right' | 'top';
  subsections?: Array<{
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
  }>;
}

export interface LandingConfig {
  id: string;
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
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateLandingConfigRequest {
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
  sections: Omit<LandingSection, 'id'>[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
}

export interface UpdateLandingConfigRequest extends Partial<CreateLandingConfigRequest> {
  id: string;
}

class LandingConfigService {
  private readonly COLLECTION_NAME = 'landingConfig';
  private readonly DOCUMENT_ID = 'public-landing';

  /**
   * Obtiene la configuración actual de la landing
   */
  async getLandingConfig(): Promise<LandingConfig | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          heroTitle: data.heroTitle,
          heroSubtitle: data.heroSubtitle,
          heroButtonText: data.heroButtonText,
          heroButtonUrl: data.heroButtonUrl,
          heroBackgroundColor: data.heroBackgroundColor,
          heroTextColor: data.heroTextColor,
          heroButtonColor: data.heroButtonColor,
          heroAnimation: data.heroAnimation,
          sections: data.sections || [],
          seo: data.seo,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdBy: data.createdBy,
          updatedBy: data.updatedBy
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting landing config:', error);
      throw new Error('Error al obtener la configuración de la landing');
    }
  }

  /**
   * Crea una nueva configuración de landing
   */
  async createLandingConfig(
    data: CreateLandingConfigRequest,
    userId: string,
    userEmail: string
  ): Promise<LandingConfig> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      
      const landingConfig: Omit<LandingConfig, 'id'> = {
        ...data,
        sections: data.sections.map((section, index) => ({
          ...section,
          id: `section-${Date.now()}-${index}`,
          order: index
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId
      };

      await setDoc(docRef, {
        ...landingConfig,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        id: this.DOCUMENT_ID,
        ...landingConfig
      };
    } catch (error) {
      console.error('Error creating landing config:', error);
      throw new Error('Error al crear la configuración de la landing');
    }
  }

  /**
   * Actualiza la configuración de la landing
   */
  async updateLandingConfig(
    data: UpdateLandingConfigRequest,
    userId: string,
    userEmail: string
  ): Promise<LandingConfig> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      
      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      // Si hay secciones, asegurar que tengan IDs
      if (data.sections) {
        updateData.sections = data.sections.map((section, index) => ({
          ...section,
          id: section.id || `section-${Date.now()}-${index}`,
          order: section.order ?? index
        }));
      }

      await updateDoc(docRef, updateData);

      // Obtener la configuración actualizada
      const updatedConfig = await this.getLandingConfig();
      if (!updatedConfig) {
        throw new Error('No se pudo obtener la configuración actualizada');
      }

      return updatedConfig;
    } catch (error) {
      console.error('Error updating landing config:', error);
      throw new Error('Error al actualizar la configuración de la landing');
    }
  }

  /**
   * Suscripción en tiempo real a la configuración de la landing
   */
  subscribeToLandingConfig(callback: (config: LandingConfig | null) => void): () => void {
    const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const config: LandingConfig = {
          id: doc.id,
          title: data.title,
          description: data.description,
          heroTitle: data.heroTitle,
          heroSubtitle: data.heroSubtitle,
          heroButtonText: data.heroButtonText,
          heroButtonUrl: data.heroButtonUrl,
          heroBackgroundColor: data.heroBackgroundColor,
          heroTextColor: data.heroTextColor,
          heroButtonColor: data.heroButtonColor,
          heroAnimation: data.heroAnimation,
          sections: data.sections || [],
          seo: data.seo,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdBy: data.createdBy,
          updatedBy: data.updatedBy
        };
        callback(config);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error subscribing to landing config:', error);
      callback(null);
    });

    return unsubscribe;
  }

  /**
   * Obtiene la configuración por defecto
   */
  getDefaultConfig(): CreateLandingConfigRequest {
    return {
      title: "WebSapMaxDigital",
      description: "Tu solución digital definitiva para menús de restaurante",
      heroTitle: "Transforma tu restaurante con tecnología inteligente",
      heroSubtitle: "Gestiona pedidos, mesas y clientes de forma eficiente con nuestra plataforma integral",
      heroButtonText: "¡Comenzar ahora!",
      heroButtonUrl: "#contact",
      heroBackgroundColor: "#ffffff",
      heroTextColor: "#1f2937",
      heroButtonColor: "#3b82f6",
      heroAnimation: "fadeIn",
      sections: [
        {
          type: "features",
          title: "Características Principales",
          subtitle: "Descubre todo lo que podemos hacer por tu negocio",
          content: "Nuestra plataforma incluye gestión de pedidos, reportes en tiempo real, y mucho más.",
          backgroundColor: "#f8fafc",
          textColor: "#1f2937",
          buttonColor: "#3b82f6",
          buttonText: "Ver más",
          order: 0,
          isActive: true,
          animation: "slideUp",
          mediaType: null,
          mediaUrl: '',
          mediaPosition: 'left',
          subsections: []
        },
        {
          type: "services",
          title: "Nuestros Servicios",
          subtitle: "Soluciones adaptadas a tu restaurante",
          content: "Ofrecemos servicios personalizados para cada tipo de restaurante.",
          backgroundColor: "#ffffff",
          textColor: "#1f2937",
          buttonColor: "#10b981",
          buttonText: "Conocer servicios",
          order: 1,
          isActive: true,
          animation: "slideUp",
          mediaType: null,
          mediaUrl: '',
          mediaPosition: 'left',
          subsections: []
        }
      ],
      seo: {
        title: "WebSapMaxDigital - Sistema para Restaurantes",
        description: "Sistema inteligente para restaurantes con gestión de pedidos y reportes en tiempo real",
        keywords: ["restaurante", "software", "gestión", "digital", "pedidos", "mesas"]
      }
    };
  }
}

export const landingConfigService = new LandingConfigService(); 