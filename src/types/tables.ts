
import type { Timestamp } from 'firebase/firestore';

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

// Extender la interfaz Order para incluir información de mesa
export interface OrderWithTable {
  tableId?: string;
  tableNumber?: string;
  reservationDate?: string;
  reservationTime?: string;
} 
