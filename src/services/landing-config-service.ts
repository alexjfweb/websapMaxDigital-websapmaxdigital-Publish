import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auditService } from './audit-service';

// Basic structure for a subsection, like a feature card
export interface LandingSubsection {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
}

// Structure for a main section of the landing page
export interface LandingSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'contact' | 'about' | 'services';
  title: string;
  subtitle: string;
  content: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  order: number;
  isActive: boolean;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'none';
  mediaType?: 'image' | 'video' | null;
  mediaUrl?: string;
  mediaPosition?: 'left' | 'right' | 'top';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  subsections?: LandingSubsection[];
}

export interface LandingSEO {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}


// The complete configuration object for the landing page
export interface LandingConfig {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroButtonUrl: string;
  heroBackgroundColor: string;
  heroTextColor: string;
  heroButtonColor: string;
  heroAnimation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'none';
  sections: LandingSection[];
  seo: LandingSEO;
}

const CONFIG_COLLECTION_NAME = 'landing_configs';
const MAIN_CONFIG_DOC_ID = 'main';


export const getLandingDefaultConfig = (): LandingConfig => ({
  id: 'main',
  heroTitle: 'Transforma tu Restaurante con un Menú Digital',
  heroSubtitle: 'Atrae más clientes, optimiza pedidos y mejora la experiencia.',
  heroButtonText: 'Ver Planes',
  heroButtonUrl: '#planes',
  heroBackgroundColor: '#FFF2E6',
  heroTextColor: '#1f2937',
  heroButtonColor: '#FF4500',
  heroAnimation: 'fadeIn',
  sections: [
    {
      id: 'section-1',
      type: 'features',
      title: 'Características Principales',
      subtitle: 'Todo lo que necesitas para llevar tu restaurante al siguiente nivel.',
      content: 'Nuestra plataforma es fácil de usar, personalizable y está diseñada para crecer contigo.',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonColor: '#FF4500',
      buttonText: 'Explorar Funciones',
      buttonUrl: '#',
      imageUrl: '',
      order: 1,
      isActive: true,
      animation: 'fadeIn',
      seoTitle: 'Características Principales de WebSapMax',
      seoDescription: 'Descubre las características que te ayudarán a gestionar tu restaurante.',
      seoKeywords: ['gestión restaurante', 'menú qr', 'pedidos online'],
      subsections: [
        { id: 'sub-1-1', title: 'Menú con QR', content: 'Acceso instantáneo para tus clientes.', imageUrl: 'https://placehold.co/300x200.png?text=QR' },
        { id: 'sub-1-2', title: 'Gestión de Pedidos', content: 'Optimiza tu cocina y servicio.', imageUrl: 'https://placehold.co/300x200.png?text=Pedidos' },
        { id: 'sub-1-3', title: 'Reservas Online', content: 'Asegura mesas llenas.', imageUrl: 'https://placehold.co/300x200.png?text=Reservas' },
      ],
    },
  ],
  seo: {
    title: 'WebSapMax - Menús Digitales para Restaurantes',
    description: 'La solución completa para digitalizar tu restaurante. Ofrece menús con QR, gestiona pedidos y reservas de forma eficiente.',
    keywords: ['restaurante', 'menú digital', 'código qr', 'gestión de pedidos', 'software para restaurantes'],
    ogTitle: 'WebSapMax: Digitaliza tu Restaurante Hoy',
    ogDescription: 'Atrae más clientes y optimiza tu operación con nuestra plataforma de menús digitales.',
    ogImage: 'https://placehold.co/1200x630.png',
  },
});


class LandingConfigService {
  private getConfigDocRef() {
    if (!db) throw new Error("Database not available");
    return doc(db, CONFIG_COLLECTION_NAME, MAIN_CONFIG_DOC_ID);
  }

  async getLandingConfig(): Promise<LandingConfig> {
    try {
        const docSnap = await getDoc(this.getConfigDocRef());
        if (!docSnap.exists()) {
          console.warn("Landing config not found. Returning a default one. Run sync script to create it.");
          return getLandingDefaultConfig();
        }
        const data = docSnap.data();
        const defaultConfig = getLandingDefaultConfig();
        
        return {
          ...defaultConfig,
          ...data,
          id: docSnap.id,
          sections: data.sections && data.sections.length > 0 ? data.sections : defaultConfig.sections,
          seo: { ...defaultConfig.seo, ...data.seo },
        };
    } catch(error) {
        console.error("Error getting landing config:", error);
        throw new Error("Could not retrieve landing page configuration.");
    }
  }

  async updateLandingConfig(
    configUpdate: Partial<LandingConfig>,
    userId: string,
    userEmail: string
  ): Promise<void> {
    const originalDoc = await this.getLandingConfig();
    
    await setDoc(this.getConfigDocRef(), { 
      ...configUpdate,
      updatedAt: serverTimestamp() 
    }, { merge: true });

    await auditService.log({
      entity: 'landingPlans',
      entityId: MAIN_CONFIG_DOC_ID,
      action: 'updated',
      performedBy: { uid: userId, email: userEmail },
      previousData: originalDoc,
      newData: { ...originalDoc, ...configUpdate },
    });
  }
}

export const landingConfigService = new LandingConfigService();
