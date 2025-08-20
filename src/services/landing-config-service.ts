
// src/services/landing-config-service.ts
import { getDb } from '@/lib/firebase-lazy';
import { collection, doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auditService } from './audit-service';

// Interfaces for structured data
export interface LandingSubsection {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
}

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

const getDefaultConfig = (): LandingConfig => ({
  id: 'main',
  heroTitle: 'Moderniza tu negocio y aumenta tus ventas.',
  heroSubtitle: 'La solución completa para tu restaurante. Menú digital, gestión de pedidos, reservas y más.',
  heroButtonText: 'Ver Demo',
  heroButtonUrl: '#planes',
  heroBackgroundColor: '#FFFFFF',
  heroTextColor: '#1f2937',
  heroButtonColor: '#FF4500',
  heroAnimation: 'fadeIn',
  sections: [
    {
      id: 'section-1', type: 'features', title: 'Características Principales', subtitle: 'Todo lo que necesitas para digitalizar tu negocio', content: '',
      backgroundColor: '#FFFFFF', textColor: '#1f2937', buttonColor: '#FF4500', buttonText: '', buttonUrl: '', imageUrl: '',
      order: 1, isActive: true, animation: 'fadeIn',
      subsections: [
        { id: 'sub-1-1', title: 'Pago Móvil', content: 'Agiliza tus mesas, aumenta la rotación y mejora la rentabilidad.', imageUrl: 'https://images.pexels.com/photos/6260921/pexels-photo-6260921.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
        { id: 'sub-1-2', title: 'Menú con Video', content: 'Captura la atención de tus clientes con una experiencia visual única.', imageUrl: 'https://images.pexels.com/photos/3756523/pexels-photo-3756523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
        { id: 'sub-1-3', title: 'Gestión Online', content: 'Recibe órdenes desde cualquier lugar, directo a tu cocina.', imageUrl: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      ],
    },
    {
      id: 'section-2', type: 'services', title: 'Nuestros Servicios', subtitle: 'Soluciones a tu medida', content: '',
      backgroundColor: '#F9FAFB', textColor: '#1f2937', buttonColor: '#FF4500', buttonText: '', buttonUrl: '', imageUrl: '',
      order: 2, isActive: true, animation: 'fadeIn',
      subsections: [
        { id: 'sub-2-1', title: 'Marketing', content: 'Atrae a más clientes directamente desde sus teléfonos.', imageUrl: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
        { id: 'sub-2-2', title: 'QR Bar', content: 'Moderniza tu bar con un menú digital y código QR.', imageUrl: 'https://images.pexels.com/photos/7618146/pexels-photo-7618146.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
        { id: 'sub-2-3', title: 'App Mesa', content: 'Permite que los clientes pidan desde la mesa de forma fácil.', imageUrl: 'https://images.pexels.com/photos/6746816/pexels-photo-6746816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      ],
    },
  ],
  seo: {
    title: 'WebSapMax - Menús Digitales para Restaurantes',
    description: 'La solución completa para digitalizar tu restaurante. Ofrece menús con QR, gestiona pedidos y reservas.',
    keywords: ['restaurante', 'menú digital', 'código qr', 'gestión de pedidos', 'software para restaurantes'],
    ogTitle: 'WebSapMax: Digitaliza tu Restaurante Hoy',
    ogDescription: 'Atrae más clientes y optimiza tu operación con nuestra plataforma.',
    ogImage: 'https://placehold.co/1200x630.png',
  },
});

class LandingConfigService {
  private getConfigDocRef() {
    const db = getDb();
    if (!db) throw new Error("Firestore (Cliente) no está inicializado.");
    return doc(collection(db, CONFIG_COLLECTION_NAME), MAIN_CONFIG_DOC_ID);
  }

  async getLandingConfig(): Promise<LandingConfig> {
    try {
      const docRef = this.getConfigDocRef();
      const docSnap = await getDoc(docRef);
      const defaultConfig = getDefaultConfig();
      
      if (!docSnap.exists()) {
        console.warn("Landing config not found in DB, returning defaults.");
        return defaultConfig;
      }
      
      const dbData = docSnap.data();
      
      // Deep merge sections and subsections to prevent missing fields
      const mergedSections = defaultConfig.sections.map(defaultSection => {
          const dbSection = dbData.sections?.find((s: LandingSection) => s.id === defaultSection.id);
          if (dbSection) {
              const mergedSubsections = defaultSection.subsections?.map(defaultSub => {
                  const dbSub = dbSection.subsections?.find((s: LandingSubsection) => s.id === defaultSub.id);
                  return { ...defaultSub, ...(dbSub || {}) };
              });
              return { ...defaultSection, ...dbSection, subsections: mergedSubsections };
          }
          return defaultSection;
      });

      const finalConfig = {
          ...defaultConfig,
          ...dbData,
          id: docSnap.id,
          seo: { ...defaultConfig.seo, ...(dbData?.seo || {}) },
          sections: mergedSections,
      } as LandingConfig;
      
      return finalConfig;

    } catch(error: any) {
        console.error("Error getting landing config:", error.message, error.stack);
        throw new Error(`No se pudo obtener la configuración de la landing page. Causa: ${error.message}`);
    }
  }

  async updateLandingConfig(
    configUpdate: Partial<LandingConfig>,
    userId: string,
    userEmail: string
  ): Promise<void> {
    const originalDoc = await this.getLandingConfig().catch(() => getDefaultConfig());
    const docRef = this.getConfigDocRef();
    
    await setDoc(docRef, { 
      ...configUpdate,
      updatedAt: serverTimestamp() 
    }, { merge: true });

    await auditService.log({
      entity: 'landingConfigs' as any,
      entityId: MAIN_CONFIG_DOC_ID,
      action: 'updated',
      performedBy: { uid: userId, email: userEmail },
      previousData: originalDoc,
      newData: { ...originalDoc, ...configUpdate },
    });
  }

  async createLandingConfig(
      configData: LandingConfig,
      userId: string,
      userEmail: string
  ): Promise<void> {
      const { id, ...dataToSave } = configData;
      const docRef = this.getConfigDocRef();
      await setDoc(docRef, {
          ...dataToSave,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
      });

      await auditService.log({
          entity: 'landingConfigs' as any,
          entityId: MAIN_CONFIG_DOC_ID,
          action: 'created',
          performedBy: { uid: userId, email: userEmail },
          newData: configData,
      });
  }

  getDefaultConfig() {
    return getDefaultConfig();
  }
}

export const landingConfigService = new LandingConfigService();
