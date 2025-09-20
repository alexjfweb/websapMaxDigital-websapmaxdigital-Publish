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
