
// src/services/landing-config-service.ts

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auditService } from './audit-service';

// --- TYPE DEFINITIONS ---
export interface LandingSEO {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

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
  imageUrl: string;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
  mediaPosition?: 'left' | 'right' | 'top';
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonText: string;
  buttonUrl: string;
  order: number;
  isActive: boolean;
  animation: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'none';
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  subsections?: LandingSubsection[];
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
  heroAnimation: 'fadeIn' | 'slideUp' | 'none';
  sections: LandingSection[];
  seo: LandingSEO;
  createdAt?: string; // Serialized date
  updatedAt?: string; // Serialized date
}

const CONFIG_ID = "main";

// --- HELPER FUNCTIONS ---
const serializeDate = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (date instanceof Timestamp) return date.toDate().toISOString();
  return new Date(date).toISOString();
};

const getDefaultConfig = (): LandingConfig => ({
  id: CONFIG_ID,
  heroTitle: "Transforma tu Restaurante con un Menú Digital",
  heroSubtitle: "Atrae más clientes, optimiza pedidos y mejora la experiencia.",
  heroButtonText: "Ver Planes",
  heroButtonUrl: "#planes",
  heroBackgroundColor: "#FFF2E6",
  heroTextColor: "#1f2937",
  heroButtonColor: "#FF4500",
  heroAnimation: "fadeIn",
  sections: [
     {
      id: 'section-1',
      type: 'features',
      title: 'Características Principales',
      subtitle: 'Todo lo que necesitas para llevar tu restaurante al siguiente nivel.',
      content: 'Nuestra plataforma es fácil de usar, personalizable y está diseñada para crecer contigo.',
      imageUrl: 'https://placehold.co/1200x600.png?text=Features',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonColor: '#FF4500',
      buttonText: 'Explorar Funciones',
      buttonUrl: '#',
      order: 0,
      isActive: true,
      animation: 'slideUp',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
      subsections: [
        { id: 'sub-1-1', title: 'Menú con QR', content: 'Acceso instantáneo para tus clientes.', imageUrl: 'https://placehold.co/300x200.png?text=QR' },
        { id: 'sub-1-2', title: 'Gestión de Pedidos', content: 'Optimiza tu cocina y servicio.', imageUrl: 'https://placehold.co/300x200.png?text=Pedidos' },
        { id: 'sub-1-3', title: 'Reservas Online', content: 'Asegura mesas llenas.', imageUrl: 'https://placehold.co/300x200.png?text=Reservas' },
      ]
    },
  ],
  seo: {
    title: "WebSapMax - Menús Digitales para Restaurantes",
    description: "La solución completa para digitalizar tu restaurante: menú con QR, gestión de pedidos, reservas y más.",
    keywords: ["menú digital", "restaurante", "QR", "pedidos online", "reservas"],
    ogTitle: "Digitaliza tu Restaurante con WebSapMax",
    ogDescription: "Ofrece a tus clientes una experiencia moderna con nuestros menús digitales.",
    ogImage: "https://placehold.co/1200x630.png",
  },
});

const serializeConfig = (data: any): LandingConfig => {
  const defaultConfig = getDefaultConfig();
  return {
    ...defaultConfig,
    ...data,
    id: CONFIG_ID,
    createdAt: data.createdAt ? serializeDate(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? serializeDate(data.updatedAt) : undefined,
    seo: { ...defaultConfig.seo, ...data.seo },
    sections: (data.sections || []).map((s: any) => ({ ...s, subsections: s.subsections || [] })),
  };
};

class LandingConfigService {
  private readonly COLLECTION_NAME = 'landing_configs';
  private readonly CONFIG_ID = 'main';

  private get docRef() {
    return doc(db, this.COLLECTION_NAME, this.CONFIG_ID);
  }

  async getLandingConfig(): Promise<LandingConfig> {
    try {
      const docSnap = await getDoc(this.docRef);
      if (docSnap.exists()) {
        return serializeConfig(docSnap.data());
      } else {
        console.log("No config found, creating and returning a default one.");
        // If it doesn't exist, create it with default values and return them.
        const defaultConfig = getDefaultConfig();
        // Remove ID from the object being saved to avoid redundancy.
        const { id, ...configToSave } = defaultConfig;
        await setDoc(this.docRef, { ...configToSave, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        // Return the full default config object, including the ID.
        return defaultConfig;
      }
    } catch (error) {
      console.error("Error getting landing config:", error);
      throw new Error("Could not fetch landing page configuration.");
    }
  }
  
  async createLandingConfig(configData: LandingConfig, userId: string, userEmail: string): Promise<void> {
    try {
        const { id, ...dataToSave } = configData;
        await setDoc(this.docRef, {
            ...dataToSave,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        await auditService.log({
            entity: 'landingPlans', // Entity might need adjustment
            entityId: this.CONFIG_ID,
            action: 'created',
            performedBy: { uid: userId, email: userEmail },
            newData: configData,
        });
    } catch(error) {
        console.error("Error creating landing config:", error);
        throw new Error("Could not create landing page configuration.");
    }
  }

  async updateLandingConfig(configData: Partial<LandingConfig>, userId: string, userEmail: string): Promise<void> {
    try {
      const updatePayload = { ...configData, updatedAt: serverTimestamp() };
      // Use set with merge:true to create if not exists, or update if it does.
      await setDoc(this.docRef, updatePayload, { merge: true });

      // For auditing, we log the update. We don't need to fetch previous data here
      // as the primary goal is just to record the update action.
      await auditService.log({
        entity: 'landingPlans',
        entityId: this.CONFIG_ID,
        action: 'updated',
        performedBy: { uid: userId, email: userEmail },
        newData: configData, // Log the changes that were applied.
      });
    } catch (error) {
      console.error("Error updating landing config:", error);
      throw new Error("Could not update landing page configuration.");
    }
  }
}

export const landingConfigService = new LandingConfigService();

    