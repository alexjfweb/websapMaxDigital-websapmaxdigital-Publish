
import type { Timestamp } from 'firebase/firestore';

export interface RestaurantProfile {
  id: string;
  name: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  corporateColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  socialLinks?: {
    website?: string;
    menuShareLink?: string;
    facebook?: string;
    instagram?: string;
    x?: string;
    whatsapp?: string;
    tiktok?: string;
    pinterest?: string;
  };
  paymentMethods: {
    codEnabled: boolean; // Cash on Delivery
    nequi?: {
      enabled: boolean;
      qrCodeUrl?: string;
      accountHolder?: string;
      accountNumber?: string;
    };
    daviplata?: {
      enabled: boolean;
      qrCodeUrl?: string;
      accountHolder?: string;
      accountNumber?: string;
    };
    bancolombia?: {
      enabled: boolean;
      qrCodeUrl?: string;
      accountHolder?: string;
      accountNumber?: string;
    };
  };
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number; // -1 for unlimited, 0 for out of stock
  likes: number; // Number of stars or likes
  category: string; // e.g., 'Appetizers', 'Main Courses', 'Desserts'
  isFeatured?: boolean; // Optional: to highlight certain dishes
}

// Data type for the react-hook-form
export type DishFormData = {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: File | null;
};

export interface CartItem extends Dish {
  quantity: number;
}

export type UserRole = 'guest' | 'employee' | 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string; // Added name for display
  contact?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  registrationDate: string; // ISO date string
  avatarUrl?: string;
}

// New Project types
export interface Project {
  id: string; // Document ID from Firestore
  name: string;
  description: string;
  ownerUid: string; // UID of the user who owns/created the project
  createdAt: Timestamp; // Firestore Timestamp for when the project was created
  updatedAt: Timestamp; // Firestore Timestamp for when the project was last updated
}

export type ProjectInput = {
  name: string;
  description: string;
  ownerUid: string; // UID of the user creating the project
};

// New Company type for SuperAdmin management
export interface Company {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'pending';
  registrationDate: string; // ISO date string
  phone?: string;
  email?: string;
  category?: 'Company' | 'Restaurant';
}
