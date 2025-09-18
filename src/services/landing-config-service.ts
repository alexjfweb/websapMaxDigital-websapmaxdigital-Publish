// src/services/landing-config-service.ts
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { getDb } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore';
import { auditService } from './audit-service';

// Interfaces for structured data
export interface LandingSubsection {
  id: string;
  title: string; // Se usará para el Nombre/Autor del testimonio
  content: string; // Se usará para el texto/cita del testimonio
  imageUrl: string; // Imagen del autor
  quote?: string; // Campo específico para la cita (opcional, para claridad)
  authorRole?: string; // ej. "Dueño, Pizzería La Tradición"
  imageRadius?: number; // New field for circle radius
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
  heroContent?: string; // Campo añadido para el contenido HTML del Hero
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
const SUBSECTIONS_COLLECTION_NAME = 'landing_subsections';
const CONTENT_COLLECTION_NAME = 'landing_content';
const MAIN_CONFIG_DOC_ID = 'main';

const getDefaultConfig = (): LandingConfig => ({
  id: 'main',
  heroTitle: 'Moderniza tu negocio y aumenta tus ventas.',
  heroSubtitle: 'La solución completa para tu restaurante. Menú digital, gestión de pedidos, reservas y más.',
  heroContent: 'Descubre la revolución para tu NEGOCIO. ¿Tienes una cafetería, pizzería, food truck, panadería, pastelería, servicio de catering o cualquier otro negocio gastronómico? ¡Esta solución es para ti! </br></br>Con nuestro menú digital interactivo, tus clientes explorarán tus platos con fotos de alta calidad y descripciones detalladas, facilitando su elección y aumentando su satisfacción.</br></br>Además, nuestro sistema de gestión integral te permite controlar cada aspecto de tu negocio: desde el inventario y los pedidos hasta las mesas y el personal, todo en una sola plataforma.</br></br>Optimiza tu operación, reduce costos y toma decisiones más inteligentes con datos en tiempo real. Es la solución completa para llevar tu restaurante a un nuevo nivel de eficiencia y rentabilidad.',
  heroButtonText: 'Comenzar',
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
        { id: 'sub-1-1', title: 'Pago Móvil', content: 'Agiliza tus mesas, aumenta la rotación y mejora la rentabilidad.', imageUrl: 'gs://websapmax.appspot.com/subsections/pago-movil.jpg', authorRole: '', imageRadius: 0 },
        { id: 'sub-1-2', title: 'Menú con Video', content: 'Captura la atención de tus clientes con una experiencia visual única.', imageUrl: 'gs://websapmax.appspot.com/subsections/menu-video.jpg', authorRole: '', imageRadius: 0 },
        { id: 'sub-1-3', title: 'Gestión Online', content: 'Recibe órdenes desde cualquier lugar, directo a tu cocina.', imageUrl: 'gs://websapmax.appspot.com/subsections/gestion-online.jpg', authorRole: '', imageRadius: 0 },
      ],
    },
    {
      id: 'section-2', type: 'services', title: 'Nuestros Servicios', subtitle: 'Soluciones a tu medida', content: '',
      backgroundColor: '#F9FAFB', textColor: '#1f2937', buttonColor: '#FF4500', buttonText: '', buttonUrl: '', imageUrl: '',
      order: 2, isActive: true, animation: 'fadeIn',
      subsections: [
        { id: 'sub-2-1', title: 'Marketing', content: 'Atrae a más clientes directamente desde sus teléfonos.', imageUrl: 'gs://websapmax.appspot.com/subsections/marketing.jpg', authorRole: '', imageRadius: 0 },
        { id: 'sub-2-2', title: 'QR Bar', content: 'Moderniza tu bar con un menú digital y código QR.', imageUrl: 'gs://websapmax.appspot.com/subsections/bar.jpg', authorRole: '', imageRadius: 0 },
        { id: 'sub-2-3', title: 'App Mesa', content: 'Permite que los clientes pidan desde la mesa de forma fácil.', imageUrl: 'gs://websapmax.appspot.com/subsections/mesa.jpg', authorRole: '', imageRadius: 0 },
      ],
    },
    {
      id: 'section-3', type: 'testimonials', title: 'Lo que nuestros clientes dicen', subtitle: 'Descubre cómo hemos ayudado a otros negocios a crecer', content: '',
      backgroundColor: '#FFFFFF', textColor: '#1f2937', buttonColor: '#FF4500', buttonText: '', buttonUrl: '', imageUrl: '',
      order: 3, isActive: true, animation: 'fadeIn',
      subsections: [
        { id: 'sub-3-1', title: 'Ana López', authorRole: 'Dueña, Restaurante Café del Sol', content: 'WebSapMax transformó nuestra operación. Los pedidos online y el menú QR han sido un cambio de juego para nosotros.', imageUrl: 'https://placehold.co/100x100.png', imageRadius: 50 },
        { id: 'sub-3-2', title: 'Juan M.', authorRole: 'Gerente, Burger Hub', content: 'La gestión de mesas y reservas nunca ha sido tan fácil. Nuestros clientes aman la simplicidad y nosotros amamos la eficiencia.', imageUrl: 'https://placehold.co/100x100.png', imageRadius: 50 },
      ]
    }
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
  private get db() {
    return getDb();
  }

  private getConfigDocRef() {
    return doc(this.db, CONFIG_COLLECTION_NAME, MAIN_CONFIG_DOC_ID);
  }

  private getSubsectionsDocRef(sectionId: string) {
    return doc(this.db, SUBSECTIONS_COLLECTION_NAME, `${sectionId}_subsections`);
  }
  
  private getContentDocRef(contentId: string) {
    return doc(this.db, CONTENT_COLLECTION_NAME, contentId);
  }

  private async getImageUrl(path: string): Promise<string> {
    const placeholder = 'https://placehold.co/400x300.png?text=...';
    if (!path) return placeholder;
    if (path.startsWith('http')) return path;
    
    const storage = getStorage();

    if (path.startsWith('gs://')) {
      try {
        const imageRef = ref(storage, path);
        return await getDownloadURL(imageRef);
      } catch (error) {
        console.warn(`[Servicio Landing] No se pudo obtener la URL para gs path "${path}".`, error);
        return placeholder;
      }
    }
    
    try {
        const imageRef = ref(storage, path);
        return await getDownloadURL(imageRef);
    } catch(e) {
        console.warn(`[Servicio Landing] No se pudo obtener la URL para el archivo "${path}".`, e);
        return placeholder;
    }
  }

  async getLandingConfig(): Promise<LandingConfig> {
    const docRef = this.getConfigDocRef();
    const docSnap = await getDoc(docRef);
    const defaultConfig = getDefaultConfig();
    
    if (!docSnap.exists()) {
      console.warn("Landing config not found in DB. Returning default config.");
      return defaultConfig;
    }
    
    const dbData = docSnap.data();

    // Fetch heroContent separately
    const heroContentDocRef = this.getContentDocRef('hero_content');
    const heroContentSnap = await getDoc(heroContentDocRef);
    const heroContent = heroContentSnap.exists() ? heroContentSnap.data().content : '';
    
    const resolvedSections = await Promise.all(
        (dbData.sections || []).map(async (section: LandingSection) => {
            const subsectionsDocRef = this.getSubsectionsDocRef(section.id);
            const contentDocRef = this.getContentDocRef(section.id);

            const [subsectionsSnap, contentSnap] = await Promise.all([
                getDoc(subsectionsDocRef),
                getDoc(contentDocRef)
            ]);
            
            let resolvedSubsections: LandingSubsection[] = [];
            if (subsectionsSnap.exists()) {
                const subsectionsData = subsectionsSnap.data().subsections || [];
                resolvedSubsections = await Promise.all(
                    subsectionsData.map(async (sub: LandingSubsection) => ({
                        ...sub,
                        imageUrl: await this.getImageUrl(sub.imageUrl),
                    }))
                );
            }
            
            const sectionContent = contentSnap.exists() ? contentSnap.data().content : '';
            
            return { 
                ...section, 
                content: sectionContent,
                subsections: resolvedSubsections 
            };
        })
    );

    return {
      ...defaultConfig,
      ...dbData,
      id: docSnap.id,
      heroContent: heroContent,
      sections: resolvedSections,
      seo: { ...defaultConfig.seo, ...(dbData?.seo || {}) },
    };
  }

  async updateLandingConfig(
    configUpdate: Partial<LandingConfig>,
    userId: string,
    userEmail: string
  ): Promise<void> {
    const originalDoc = await this.getLandingConfig().catch(() => getDefaultConfig());
    const docRef = this.getConfigDocRef();
    const batch = writeBatch(this.db);
    
    // 1. Prepara el documento principal EXCLUYENDO campos grandes
    const { sections, heroContent, ...mainData } = configUpdate;
    const mainDocUpdate: { [key: string]: any } = {
        ...mainData,
        updatedAt: serverTimestamp()
    };

    // Esto es crucial: eliminamos 'sections' y 'heroContent' del objeto que va al documento principal
    delete mainDocUpdate.sections;
    delete mainDocUpdate.heroContent;

    batch.set(docRef, mainDocUpdate, { merge: true });
    
    // 2. Guarda el heroContent en su propio documento
    if (heroContent !== undefined) {
        const heroContentDocRef = this.getContentDocRef('hero_content');
        batch.set(heroContentDocRef, { content: heroContent, updatedAt: serverTimestamp() }, { merge: true });
    }

    // 3. Procesa cada sección
    if (sections) {
      // Guarda la ESTRUCTURA de las secciones (sin contenido pesado) en el documento principal
      const sectionsForMainDoc = sections.map(({ content, subsections, ...sectionData }) => sectionData);
      batch.update(docRef, { sections: sectionsForMainDoc });

      // Ahora, para cada sección, guarda su contenido y subsecciones en documentos separados
      for (const section of sections) {
        // Guarda el 'content' de la sección
        const contentDocRef = this.getContentDocRef(section.id);
        batch.set(contentDocRef, { content: section.content || '', updatedAt: serverTimestamp() }, { merge: true });

        // Guarda las 'subsections' si existen
        if (section.subsections && section.subsections.length > 0) {
          const subsectionsDocRef = this.getSubsectionsDocRef(section.id);
          batch.set(subsectionsDocRef, { subsections: section.subsections, updatedAt: serverTimestamp() }, { merge: true });
        }
      }
    }
    
    // 4. Ejecuta todas las operaciones en un solo batch
    await batch.commit();

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
      const { id, heroContent, sections, ...dataToSave } = configData;
      const docRef = this.getConfigDocRef();
      
      const batch = writeBatch(this.db);

      const sectionsForMainDoc = sections.map(({ subsections, content, ...sectionData }) => sectionData);
      
      batch.set(docRef, {
          ...dataToSave,
          sections: sectionsForMainDoc,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
      });

      if (heroContent) {
          const heroContentDocRef = this.getContentDocRef('hero_content');
          batch.set(heroContentDocRef, { content: heroContent, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }

      for (const section of sections) {
          const contentDocRef = this.getContentDocRef(section.id);
          batch.set(contentDocRef, { content: section.content, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

          if (section.subsections && section.subsections.length > 0) {
              const subsectionsDocRef = this.getSubsectionsDocRef(section.id);
              batch.set(subsectionsDocRef, { subsections: section.subsections, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
          }
      }

      await batch.commit();

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
