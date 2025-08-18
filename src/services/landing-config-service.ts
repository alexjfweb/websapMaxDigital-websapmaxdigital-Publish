
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


// Default configuration is now a private function within the service
export const getLandingDefaultConfig = (): LandingConfig => ({
  id: 'main',
  heroTitle: 'Moderniza tu negocio y aumenta tus ventas.',
  heroSubtitle: 'Descubre la revolución para tu NEGOCIO. ¿Tienes una cafetería, pizzería, food truck, panadería, pastelería, servicio de catering o cualquier otro negocio gastronómico? ¡Esta solución es para ti! Con nuestro menú digital interactivo, tus clientes explorarán tus platos con fotos de alta calidad y descripciones detalladas, facilitando su elección y aumentando su satisfacción. Además, nuestro sistema de gestión integral te permite controlar cada aspecto de tu negocio: desde el inventario y los pedidos hasta las mesas y el personal, todo en una sola plataforma. Optimiza tu operación, reduce costos y toma decisiones más inteligentes con datos en tiempo real. Es la solución completa para llevar tu restaurante a un nuevo nivel de eficiencia y rentabilidad.',
  heroButtonText: 'Ver Demo',
  heroButtonUrl: '#planes',
  heroBackgroundColor: '#FFFFFF',
  heroTextColor: '#1f2937',
  heroButtonColor: '#FF4500',
  heroAnimation: 'fadeIn',
  sections: [
    {
      id: 'section-1',
      type: 'features',
      title: 'Características Principales',
      subtitle: 'Todo lo que necesitas para digitalizar tu negocio',
      content: '',
      backgroundColor: '#FFFFFF',
      textColor: '#1f2937',
      buttonColor: '#FF4500',
      buttonText: '',
      buttonUrl: '',
      imageUrl: '',
      order: 1,
      isActive: true,
      animation: 'fadeIn',
      subsections: [
        { id: 'sub-1-1', title: 'Pago Móvil', content: 'Revoluciona la experiencia de tus clientes con nuestro sistema de menú digital y pago desde el móvil. Ahora, tus comensales pueden ordenar y pagar de forma segura y sin esperas, directo desde su smartphone. Agiliza tus mesas, aumenta la rotación de clientes y mejora la rentabilidad de tu restaurante, todo con un proceso sencillo y moderno.', imageUrl: 'https://placehold.co/400x300.png' },
        { id: 'sub-1-2', title: 'Menú con Video', content: 'Imagina un menú que cobra vida: muestra tu herramienta para personalizar tu menú digital con videos de tus deliciosos platos directamente desde Bucaramanga. Captura la atención de tus clientes en Santander, ofreciéndoles una experiencia visual única antes de ordenar. Destaca tus especialidades y aumenta el apetito, convirtiendo tus ventas y modernizando tu restaurante en Colombia.', imageUrl: 'https://placehold.co/400x300.png' },
        { id: 'sub-1-3', title: 'Gestión Online', content: 'Lleva tu restaurante en Bucaramanga al siguiente nivel: nuestro sistema de gestión con integración de pedidos en línea te permite recibir órdenes desde cualquier lugar de Santander, directo a tu cocina. Agiliza tu operación, expande tu alcance y ofrece comodidad a tus clientes, aumentando tus ventas y optimizando tu servicio en toda Colombia.', imageUrl: 'https://placehold.co/400x300.png' },
      ],
    },
     {
      id: 'section-2',
      type: 'services',
      title: 'Nuestros Servicios',
      subtitle: 'Soluciones a tu medida',
      content: '',
      backgroundColor: '#F9FAFB',
      textColor: '#1f2937',
      buttonColor: '#FF4500',
      buttonText: '',
      buttonUrl: '',
      imageUrl: '',
      order: 2,
      isActive: true,
      animation: 'fadeIn',
      subsections: [
        { id: 'sub-2-1', title: 'Marketing', content: '¿Su restaurante está lleno todas las noches? Si no, sus clientes potenciales están cenando en la competencia. Haga que su restaurante sea la primera opción para comensales hambrientos en su área. Deje de esperar a que los clientes entren por la puerta y comience a atraerlos directamente desde sus teléfonos.', imageUrl: 'https://placehold.co/400x300.png' },
        { id: 'sub-2-2', title: 'QR Bar', content: 'Crear menú digital con código QR para mi bar. Transforma la experiencia en tu bar con un menú digital y código QR. Acepta pedidos, realiza cobros y crea una carta siempre actualizada, atrayendo a más clientes con una tecnología moderna y segura. Ofrece a tus visitantes una forma fácil de explorar tus bebidas y platos, mejorando su experiencia de consumo y aumentando tus ventas.', imageUrl: 'https://placehold.co/400x300.png' },
        { id: 'sub-2-3', title: 'App Mesa', content: 'App de menú digital para tomar pedidos en la mesa. Transforma la experiencia de tus clientes en su ciudad con nuestra app de menú digital: pedir desde la mesa nunca fue tan fácil. Agiliza tu servicio, reduce errores y ofrece a tus comensales una carta interactiva y atractiva. Incrementa la eficiencia de tu personal y la satisfacción de tus clientes, optimizando así tus ventas.', imageUrl: 'https://placehold.co/400x300.png' },
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
    if (!db) throw new Error("La base de datos no está inicializada.");
    return doc(db, CONFIG_COLLECTION_NAME, MAIN_CONFIG_DOC_ID);
  }

  async getLandingConfig(): Promise<LandingConfig | null> {
    try {
        const docSnap = await getDoc(this.getConfigDocRef());
        if (!docSnap.exists()) {
          console.warn("Landing config not found.");
          return null;
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
    } catch(error: any) {
        console.error("Error getting landing config:", error.message);
        throw new Error("No se pudo obtener la configuración de la página de inicio.");
    }
  }

  async updateLandingConfig(
    configUpdate: Partial<LandingConfig>,
    userId: string,
    userEmail: string
  ): Promise<void> {
    const originalDoc = await this.getLandingConfig().catch(() => getLandingDefaultConfig());
    
    await setDoc(this.getConfigDocRef(), { 
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
        await setDoc(this.getConfigDocRef(), {
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
    return getLandingDefaultConfig();
  }
}

export const landingConfigService = new LandingConfigService();
