
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auditService } from './audit-service';

// --- INTERFACES (sin cambios) ---
export interface LandingSEO { /* ... */ }
export interface LandingSection { /* ... */ }
export interface LandingConfig { /* ... */ }

// --- FUNCIÓN DE SERIALIZACIÓN ---
const serializeLandingConfig = (data: any): LandingConfig => {
  const serializedData = { ...data };
  
  // Serializa los timestamps de nivel superior si existen
  if (serializedData.createdAt && serializedData.createdAt instanceof Timestamp) {
    serializedData.createdAt = serializedData.createdAt.toDate().toISOString();
  }
  if (serializedData.updatedAt && serializedData.updatedAt instanceof Timestamp) {
    serializedData.updatedAt = serializedData.updatedAt.toDate().toISOString();
  }

  // Asegura que las secciones y subsecciones sean arrays
  if (Array.isArray(serializedData.sections)) {
    serializedData.sections = serializedData.sections.map((section: any) => ({
      ...section,
      subsections: section.subsections || [],
    }));
  } else {
    serializedData.sections = [];
  }
  
  return serializedData as LandingConfig;
};


class LandingConfigService {
  private readonly COLLECTION_NAME = 'landing_configs';
  private readonly CONFIG_ID = "main";
  
  getDefaultConfig(): LandingConfig {
    // ... (El contenido de esta función no cambia)
  }

  async getLandingConfig(): Promise<LandingConfig> {
    const docRef = doc(db, this.COLLECTION_NAME, this.CONFIG_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const dbData = docSnap.data();
      const defaultConfig = this.getDefaultConfig();
      
      const mergedData = {
        ...defaultConfig,
        ...dbData,
        seo: { ...defaultConfig.seo, ...dbData.seo },
      };

      // **LA SOLUCIÓN DEFINITIVA**
      return serializeLandingConfig(mergedData);

    } else {
      const defaultConfig = this.getDefaultConfig();
      await setDoc(docRef, { 
        ...defaultConfig, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp() 
      });
      // Devuelve la versión por defecto que ya es serializable
      return defaultConfig;
    }
  }

  async updateLandingConfig(configData: Partial<LandingConfig>, userId: string, userEmail: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, this.CONFIG_ID);
    const currentConfig = await this.getLandingConfig();
    
    await setDoc(docRef, {
      ...configData,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await auditService.log({
      entity: 'landing_configs',
      entityId: this.CONFIG_ID,
      action: 'updated',
      performedBy: { uid: userId, email: userEmail },
      previousData: currentConfig, // ya está serializado
      newData: { ...currentConfig, ...configData },
    });
  }
}

export const landingConfigService = new LandingConfigService();
// Pegar las interfaces aquí si estaban fuera de la clase
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
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  subsections?: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
  }[];
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
  createdAt?: string; // Aseguramos que sea string
  updatedAt?: string; // Aseguramos que sea string
}
