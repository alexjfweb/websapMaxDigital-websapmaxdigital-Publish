export type LandingSection =
  | "banner"
  | "servicios"
  | "contacto"
  | "redes"
  | "video"
  | "custom";

export interface LandingSectionConfig {
  id: string;
  type: LandingSection;
  active: boolean;
  order: number;
  content: any; // Se detalla por tipo de sección
}

export interface LandingSEOConfig {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogImage: string;
}

export interface LandingConfig {
  title: string;
  subtitle: string;
  buttonColor: string;
  textColor: string;
  sections: LandingSectionConfig[];
  seo: LandingSEOConfig;
} 