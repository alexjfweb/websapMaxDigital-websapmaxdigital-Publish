// src/services/landing-config-service.ts

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auditService } from './audit-service';
import type { LandingConfig, LandingSection, LandingSEO } from '@/types';


const CONFIG_ID = "main";

// --- HELPER FUNCTIONS ---
const serializeDate = (date: any): string | null => {
  if (!date) return null;
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') {
    const d = new Date(date);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  if (date && typeof date.seconds === 'number') {
    return new Date(date.seconds * 1000).toISOString();
  }
  return null;
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

const serializeConfig = (data: any): LandingConfig | null => {
  if (!data) return null;
  const defaultConfig = getDefaultConfig();
  const serialized = {
    ...defaultConfig,
    ...data,
    id: CONFIG_ID,
    createdAt: serializeDate(data.createdAt) || undefined,
    updatedAt: serializeDate(data.updatedAt) || undefined,
    seo: { ...defaultConfig.seo, ...data.seo },
    sections: (data.sections || []).map((s: any) => ({ ...s, subsections: s.subsections || [] })),
  };
  return serialized as LandingConfig;
};

class LandingConfigService {
  private readonly COLLECTION_NAME = 'landing_configs';
  private readonly CONFIG_ID = 'main';

  private get docRef() {
    return doc(db, this.COLLECTION_NAME, this.CONFIG_ID);
  }

  // SIMPLIFICADO: Solo lee. No intenta crear.
  async getLandingConfig(): Promise<LandingConfig | null> {
    try {
      const docSnap = await getDoc(this.docRef);
      if (docSnap.exists()) {
        return serializeConfig(docSnap.data());
      }
      // Si no existe, devuelve null. La creación se maneja externamente.
      console.warn("No se encontró configuración de landing. Se debe ejecutar la sincronización inicial.");
      return null;
    } catch (error) {
      console.error("Error getting landing config:", error);
      throw new Error("No se pudo obtener la configuración de la landing page.");
    }
  }
  
  // SIMPLIFICADO: Solo actualiza.
  async updateLandingConfig(configData: Partial<LandingConfig>, userId: string, userEmail: string): Promise<void> {
    try {
      const updatePayload = { ...configData, updatedAt: serverTimestamp() };
      await setDoc(this.docRef, updatePayload, { merge: true });

      await auditService.log({
        entity: 'landingPlans', // Entity might need adjustment
        entityId: this.CONFIG_ID,
        action: 'updated',
        performedBy: { uid: userId, email: userEmail },
        newData: configData,
      });
    } catch (error) {
      console.error("Error updating landing config:", error);
      throw new Error("No se pudo actualizar la configuración de la landing page.");
    }
  }

  // Función para ser usada por el servicio de sincronización
  async createDefaultConfig(userId: string, userEmail: string): Promise<void> {
    try {
        const defaultConfig = getDefaultConfig();
        const { id, ...dataToSave } = defaultConfig;
        await setDoc(this.docRef, {
            ...dataToSave,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        await auditService.log({
            entity: 'landingPlans', // Consider a 'config' entity
            entityId: this.CONFIG_ID,
            action: 'created',
            performedBy: { uid: userId, email: userEmail },
            newData: defaultConfig,
            details: "Configuración de landing creada por sincronización inicial."
        });
    } catch(error) {
        console.error("Error creating default landing config:", error);
        throw new Error("No se pudo crear la configuración de landing por defecto.");
    }
  }
}

export const landingConfigService = new LandingConfigService();
export { getDefaultConfig as getLandingDefaultConfig }; // Export for sync service
