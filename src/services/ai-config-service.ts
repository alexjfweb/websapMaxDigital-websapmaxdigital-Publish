// src/services/ai-config-service.ts
import { getDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface AIModelConfig {
  id: string;
  provider: 'Google Gemini' | 'OpenAI GPT' | 'Custom API';
  name: string;
  apiKey: string;
  active: boolean;
}

export interface AIConfig {
  models: AIModelConfig[];
  temperature: number;
  maxTokens: number;
}

const CONFIG_COLLECTION = 'configuration';
const AI_CONFIG_DOC_ID = 'ai-models-config';

// Configuración inicial por defecto
const getDefaultAIConfig = (): AIConfig => ({
  models: [
    { id: '1', provider: 'Google Gemini', name: 'gemini-pro', apiKey: '...tur8i', active: true },
    { id: '2', provider: 'OpenAI GPT', name: 'gpt-4o', apiKey: '...h4fg6', active: false },
  ],
  temperature: 0.7,
  maxTokens: 1024,
});

class AiConfigService {
  private get configDocRef() {
    const db = getDb();
    return doc(db, CONFIG_COLLECTION, AI_CONFIG_DOC_ID);
  }

  async getAIConfig(): Promise<AIConfig> {
    try {
      const docSnap = await getDoc(this.configDocRef);
      if (docSnap.exists()) {
        // Combinar la configuración guardada con la por defecto para asegurar que todos los campos existan
        const dbData = docSnap.data() as Partial<AIConfig>;
        const defaultConfig = getDefaultAIConfig();
        return {
          ...defaultConfig,
          ...dbData,
          models: dbData.models || defaultConfig.models,
        };
      } else {
        // Si no existe, crea el documento con la configuración por defecto y la devuelve
        console.log('No AI config found, creating default...');
        const defaultConfig = getDefaultAIConfig();
        await setDoc(this.configDocRef, { ...defaultConfig, createdAt: serverTimestamp() });
        return defaultConfig;
      }
    } catch (error) {
      console.error("Error fetching AI config:", error);
      // En caso de error, devolver la configuración por defecto para no romper la UI
      return getDefaultAIConfig();
    }
  }

  async updateAIConfig(config: AIConfig): Promise<void> {
    try {
      await setDoc(this.configDocRef, {
        ...config,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error("Error updating AI config:", error);
      throw new Error("No se pudo guardar la configuración de IA en la base de datos.");
    }
  }
}

export const aiConfigService = new AiConfigService();
