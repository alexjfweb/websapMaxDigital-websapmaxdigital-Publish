
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auditService } from './audit-service';
import type { LandingConfig, LandingSection, LandingSEO } from '@/types/landing';

// Función de serialización para asegurar que los datos sean seguros para el cliente
const serializeLandingConfig = (data: any): LandingConfig => {
  const serializedData = { ...data };
  
  if (serializedData.createdAt && serializedData.createdAt instanceof Timestamp) {
    serializedData.createdAt = serializedData.createdAt.toDate().toISOString();
  }
  if (serializedData.updatedAt && serializedData.updatedAt instanceof Timestamp) {
    serializedData.updatedAt = serializedData.updatedAt.toDate().toISOString();
  }

  // Asegura que las secciones y subsecciones sean arrays, incluso si no existen
  serializedData.sections = (serializedData.sections || []).map((section: any) => ({
    ...section,
    subsections: section.subsections || [],
  }));
  
  return serializedData as LandingConfig;
};

class LandingConfigService {
  private readonly COLLECTION_NAME = 'landing_configs';
  private readonly CONFIG_ID = "main";
  
  getDefaultConfig(): LandingConfig {
    return {
        title: 'WebSapMax - Tu Menú Digital Inteligente',
        description: 'La solución definitiva para digitalizar el menú de tu restaurante, gestionar pedidos y reservas de forma eficiente.',
        heroTitle: 'Transforma la Experiencia de tu Restaurante',
        heroSubtitle: 'Digitaliza tu menú, optimiza tus pedidos y fideliza a tus clientes con nuestra plataforma todo en uno.',
        heroButtonText: 'Ver Planes',
        heroButtonUrl: '#plans',
        heroBackgroundColor: '#FFF2E6',
        heroTextColor: '#222222',
        heroButtonColor: '#FF4500',
        heroAnimation: 'fadeIn',
        sections: [],
        seo: {
            title: 'WebSapMax | Menús Digitales y Gestión de Restaurantes',
            description: 'Ofrece a tus clientes una experiencia moderna con menús digitales interactivos, QR, gestión de pedidos y reservas. ¡Comienza hoy!',
            keywords: ['menú digital', 'restaurante', 'QR', 'gestión de pedidos', 'reservas online'],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
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

      return serializeLandingConfig(mergedData);

    } else {
      const defaultConfig = this.getDefaultConfig();
      await setDoc(docRef, { 
        ...defaultConfig, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp() 
      });
      return defaultConfig; // Ya es serializable
    }
  }

  async createLandingConfig(configData: LandingConfig, userId: string, userEmail: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, this.CONFIG_ID);
    await setDoc(docRef, {
      ...configData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await auditService.log({
      entity: 'landing_configs',
      entityId: this.CONFIG_ID,
      action: 'created',
      performedBy: { uid: userId, email: userEmail },
      newData: configData,
    });
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
      previousData: currentConfig,
      newData: { ...currentConfig, ...configData },
    });
  }
}

export const landingConfigService = new LandingConfigService();
