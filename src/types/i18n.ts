import { translations } from '@/translations';

export type Language = keyof typeof translations;
export type Translations = typeof translations; 