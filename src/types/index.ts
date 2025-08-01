

import type { Timestamp } from 'firebase/firestore';


export interface RestaurantProfile {
  id: string;
  name: string;
  logoUrl: string;
  bannerUrl?: string; // Add bannerUrl here
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
  companyId: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
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
  id: string; // Document ID, same as uid for simplicity
  uid: string; // Firebase Auth User ID
  username: string;
  email: string;
  name?: string; // Legacy or display name
  firstName?: string; // Preferred field
  lastName?: string;  // Preferred field
  businessName?: string; // For admin users
  contact?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  registrationDate: string; // ISO date string
  avatarUrl?: string;
  companyId?: string; // Tenant ID
  isActive?: boolean; // To control access
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
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  ruc: string; // Registro Único de Contribuyentes o ID fiscal
  location: string; // Ciudad/País
  addressStreet?: string;
  addressNeighborhood?: string;
  addressState?: string;
  addressPostalCode?: string;
  companyType?: string; // SAS, Ltda.
  status: 'active' | 'inactive' | 'pending';
  registrationDate: string; // ISO date string
  phone?: string; // Teléfono móvil (WhatsApp)
  phoneFixed?: string; // Teléfono fijo
  email?: string;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  socialLinks?: {
    website?: string;
    menuShareLink?: string;
  };
  paymentMethods?: any; // Define properly if needed
  corporateColors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
  }
}
// Sistema de Gestión de Mesas
export interface Table {
  id: string;
  number: number;
  capacity: number;
  zone: string;
  status: 'available' | 'occupied' | 'reserved' | 'out_of_service';
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp;
  currentOrderId?: string;
  reservationDate?: string;
  reservationTime?: string;
}

export type TableInput = {
  number: string;
  capacity: number;
  zone: string;
  status: 'available' | 'occupied' | 'reserved' | 'out_of_service';
};

export interface TableAuditLog {
  id: string;
  tableId: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'reserved' | 'freed';
  previousStatus?: string;
  newStatus?: string;
  userId: string;
  userRole: string;
  timestamp: Timestamp;
  details?: string;
}

// Definición de un Pedido
export interface Order {
  id: string;
  customerName: string;
  date: string; // ISO date string
  items: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled';
  type: 'delivery' | 'pickup' | 'dine-in';
  restaurantId: string;
  productos: { id: string, nombre: string, cantidad: number, precio: number }[];
  cliente: {
    nombre: string;
    telefono: string;
    direccion: string;
    correo?: string;
    notas?: string;
  };
  mesa?: {
    tableId: string;
    tableNumber: number;
  };
}

// Definición de una Reserva
export interface Reservation {
  id: string;
  companyId: string;
  customerName: string;
  customerPhone: string;
  dateTime: string; // ISO date string
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Audit Log Global
export interface AuditLog {
  id?: string;
  entity: 'landingPlans' | 'companies' | 'users';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'reordered' | 'status_changed' | 'role_changed';
  performedBy: {
    uid: string;
    email: string;
  };
  timestamp: Timestamp;
  diff?: Record<string, { from: any; to: any }>;
  previousData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}
