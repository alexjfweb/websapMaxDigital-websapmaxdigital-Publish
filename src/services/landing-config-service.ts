
// src/services/landing-config-service.ts
import { getDb } from '@/lib/firebase-lazy';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
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
        { id: 'sub-1-1', title: 'Pago Móvil', content: 'Agiliza tus mesas, aumenta la rotación y mejora la rentabilidad.', imageUrl: 'gs://websapmax.appspot.com/subsections/feijoada.jpg' },
        { id: 'sub-1-2', title: 'Menú con Video', content: 'Captura la atención de tus clientes con una experiencia visual única.', imageUrl: 'gs://websapmax.appspot.com/subsections/paella.jpg' },
        { id: 'sub-1-3', title: 'Gestión Online', content: 'Recibe órdenes desde cualquier lugar, directo a tu cocina.', imageUrl: 'gs://websapmax.appspot.com/subsections/sushi.jpg' },
      ],
    },
    {
      id: 'section-2', type: 'services', title: 'Nuestros Servicios', subtitle: 'Soluciones a tu medida', content: '',
      backgroundColor: '#F9FAFB', textColor: '#1f2937', buttonColor: '#FF4500', buttonText: '', buttonUrl: '', imageUrl: '',
      order: 2, isActive: true, animation: 'fadeIn',
      subsections: [
        { id: 'sub-2-1', title: 'Marketing', content: 'Atrae a más clientes directamente desde sus teléfonos.', imageUrl: 'gs://websapmax.appspot.com/subsections/marketing.jpg' },
        { id: 'sub-2-2', title: 'QR Bar', content: 'Moderniza tu bar con un menú digital y código QR.', imageUrl: 'gs://websapmax.appspot.com/subsections/bar.jpg' },
        { id: 'sub-2-3', title: 'App Mesa', content: 'Permite que los clientes pidan desde la mesa de forma fácil.', imageUrl: 'gs://websapmax.appspot.com/subsections/mesa.jpg' },
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
  
  private async getImageUrl(path: string): Promise<string> {
    if (!path) return 'https://placehold.co/400x300.png?text=No+Image';
    
    // Si ya es una URL HTTPS, la devolvemos directamente.
    if (path.startsWith('https://')) {
        return path;
    }
    
    // Si es una ruta de Firebase Storage (gs://), obtenemos la URL de descarga.
    if (path.startsWith('gs://')) {
        try {
            const storage = getStorage();
            const imageRef = ref(storage, path);
            return await getDownloadURL(imageRef);
        } catch (error) {
            console.error(`Error al obtener URL para la ruta GS "${path}":`, error);
            return 'https://placehold.co/400x300.png?text=Error+GS';
        }
    }
    
    // Si no es ninguno de los anteriores, asumimos que es un nombre de archivo en la carpeta 'subsections'.
    try {
      const storage = getStorage();
      const imageRef = ref(storage, `subsections/${path}`);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error(`Error al obtener URL para el archivo "${path}":`, error);
      return 'https://placehold.co/400x300.png?text=Error+File';
    }
  }


  async getLandingConfig(): Promise<LandingConfig> {
    try {
      const docRef = this.getConfigDocRef();
      const docSnap = await getDoc(docRef);
      const defaultConfig = getDefaultConfig();
      
      if (!docSnap.exists()) {
        console.warn("Landing config not found in DB. Returning default config.");
        return defaultConfig;
      }
      
      const dbData = docSnap.data();
      
      const sectionsFromDb = dbData.sections || [];
      
      // Proceso de fusión y obtención de URLs de imágenes
      const mergedSectionsPromises = defaultConfig.sections.map(async (defaultSection) => {
        const dbSection = sectionsFromDb.find((s: LandingSection) => s.id === defaultSection.id) || defaultSection;
        
        const subsectionsWithUrlsPromises = (dbSection.subsections || []).map(async (sub: LandingSubsection) => {
          const defaultSub = defaultConfig.sections
            .flatMap(s => s.subsections || [])
            .find(ds => ds.id === sub.id) || {};
          
          return {
            ...defaultSub,
            ...sub,
            imageUrl: await this.getImageUrl(sub.imageUrl || defaultSub.imageUrl),
          };
        });
        
        const subsectionsWithUrls = await Promise.all(subsectionsWithUrlsPromises);
        
        return { ...defaultSection, ...dbSection, subsections: subsectionsWithUrls };
      });

      const mergedSections = await Promise.all(mergedSectionsPromises);

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
        throw error;
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
