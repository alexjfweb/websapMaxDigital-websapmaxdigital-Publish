import { auditService } from './audit-service';
// ¡HEMOS QUITADO los imports de 'firebase/firestore' y '@/lib/firebase' de aquí!

// ... (todas tus interfaces LandingSEO, LandingSection, LandingConfig permanecen igual) ...
export interface LandingSEO { /* ... */ }
export interface LandingSection { /* ... */ }
export interface LandingConfig { /* ... */ }

const CONFIG_ID = "main";

class LandingConfigService {
  private readonly COLLECTION_NAME = 'landing_configs';
  
  // ... (tu función getDefaultConfig permanece igual) ...
  getDefaultConfig(): LandingConfig { /* ... */ }

  async getLandingConfig(): Promise<LandingConfig> {
    // ¡SOLUCIÓN! Importaciones dinámicas dentro de la función.
    const { db } = await import('@/lib/firebase');
    const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');

    const docRef = doc(db, this.COLLECTION_NAME, CONFIG_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // ... (el resto de tu lógica de getLandingConfig permanece igual) ...
      const dbData = docSnap.data();
      const defaultConfig = this.getDefaultConfig();
      const sections = (dbData.sections && Array.isArray(dbData.sections))
        ? dbData.sections.map((s: any) => ({ ...s, subsections: s.subsections || [] }))
        : defaultConfig.sections;
      return { ...defaultConfig, ...dbData, seo: { ...defaultConfig.seo, ...dbData.seo }, sections };
    } else {
      console.log("No se encontró configuración de landing. Creando una por defecto.");
      const defaultConfig = this.getDefaultConfig();
      await setDoc(docRef, { ...defaultConfig, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return defaultConfig;
    }
  }

  async updateLandingConfig(configData: Partial<LandingConfig>, userId: string, userEmail: string): Promise<void> {
    // ¡SOLUCIÓN! Importaciones dinámicas dentro de la función.
    const { db } = await import('@/lib/firebase');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    const docRef = doc(db, this.COLLECTION_NAME, CONFIG_ID);
    const currentConfig = await this.getLandingConfig();
    const updatePayload = { ...configData, updatedAt: serverTimestamp() };
    await setDoc(docRef, updatePayload, { merge: true });

    await auditService.log({
      entity: 'landingPlans',
      entityId: CONFIG_ID,
      action: 'updated',
      performedBy: { uid: userId, email: userEmail },
      previousData: currentConfig,
      newData: { ...currentConfig, ...configData },
    });
  }
  
  // ... (tu función cleanupDuplicatePlans permanece igual) ...
  async cleanupDuplicatePlans() { /* ... */ }
}

export const landingConfigService = new LandingConfigService();