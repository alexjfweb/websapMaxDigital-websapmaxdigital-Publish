import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateSlug = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

export const serializeDate = (date: any): string | null => {
  if (!date) return null;
  if (date.toDate && typeof date.toDate === 'function') { // Es un Timestamp de Firestore
    return date.toDate().toISOString();
  }
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === 'string') {
    const d = new Date(date);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  if (date && typeof date.seconds === 'number' && typeof date.nanoseconds === 'number') {
    return new Date(date.seconds * 1000).toISOString();
  }
  return null;
};

/**
 * Serializa de forma segura una fecha (Timestamp, Date, o string) a un ISO string.
 * Si la fecha es inválida o nula, devuelve la fecha actual como ISO string.
 * Creada específicamente para el módulo de soporte para evitar conflictos.
 */
export const serializeSupportDate = (date: any): string => {
  if (!date) {
    return new Date().toISOString();
  }
  // Si es un Timestamp de Firestore
  if (date.toDate && typeof date.toDate === 'function') {
    return date.toDate().toISOString();
  }
  // Si ya es un objeto Date
  if (date instanceof Date) {
    return date.toISOString();
  }
  // Si es un string, intenta parsearlo
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }
   // Si es un objeto con seconds y nanoseconds (a veces pasa con Firestore)
  if (date && typeof date.seconds === 'number' && typeof date.nanoseconds === 'number') {
    return new Date(date.seconds * 1000).toISOString();
  }
  // Fallback si no se puede convertir
  return new Date().toISOString();
};