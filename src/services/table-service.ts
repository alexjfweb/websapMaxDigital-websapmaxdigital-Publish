
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';

// Este servicio ahora está diseñado para ser llamado desde componentes de cliente
// a través de rutas API, no directamente.

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'out_of_service';

export interface Table {
  id?: string;
  number: number;
  capacity: number;
  status: TableStatus;
  location?: string;
  description?: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
  restaurantId?: string;
}

export interface TableLog {
  id: string;
  tableId: string;
  tableNumber: number;
  action: 'created' | 'updated' | 'deleted' | 'reserved' | 'released' | 'status_changed';
  previousStatus?: TableStatus;
  newStatus?: TableStatus;
  details: string;
  performedBy: string;
  createdAt: Timestamp;
}


class TableService {
  
  async createTable(tableData: Omit<Table, 'id'>): Promise<string> {
    const response = await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tableData),
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to create table');
    }
    const { id } = await response.json();
    return id;
  }

  async updateTable(tableId: string, updates: Partial<Table>): Promise<void> {
     const response = await fetch(`/api/tables/${tableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to update table');
    }
  }

  async deleteTable(tableId: string): Promise<void> {
    const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to delete table');
    }
  }

  async getTable(tableId: string): Promise<Table | null> {
    if (!tableId) return null;
    const response = await fetch(`/api/tables/${tableId}`);
    if (!response.ok) {
        if(response.status === 404) return null;
        throw new Error('Failed to fetch table');
    }
    return response.json();
  }

  async getAllTables(restaurantId: string): Promise<Table[]> {
    if (!restaurantId) return [];
    const response = await fetch(`/api/companies/${restaurantId}/tables`);
    if (!response.ok) {
        throw new Error('Failed to fetch tables');
    }
    return response.json();
  }
  
  async changeTableStatus(tableId: string, newStatus: TableStatus): Promise<void> {
      await this.updateTable(tableId, { status: newStatus });
  }
  
  // Utilidades visuales (se mantienen en el cliente)
  getStatusColor(status: TableStatus): string {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out_of_service':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
  
  getActionText(action: TableLog['action']): string {
    switch (action) {
      case 'created': return 'Mesa Creada';
      case 'updated': return 'Mesa Actualizada';
      case 'deleted': return 'Mesa Eliminada';
      case 'status_changed': return 'Cambio de Estado';
      case 'reserved': return 'Mesa Reservada';
      case 'released': return 'Mesa Liberada';
      default: return action;
    }
  }

  getStatusText(status: TableStatus): string {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupada';
      case 'reserved':
        return 'Reservada';
      case 'out_of_service':
        return 'Fuera de servicio';
      default:
        return 'Desconocido';
    }
  }
}

export const tableService = new TableService();
