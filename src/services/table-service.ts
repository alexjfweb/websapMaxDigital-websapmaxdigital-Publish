import { getDb } from '@/lib/firebase';
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
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import type { TableStatus } from '@/types';

// Este servicio ahora está diseñado para ser llamado desde componentes de cliente
// a través de rutas API, no directamente.

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
    private get tablesCollection() {
      const db = getDb();
      return collection(db, 'tables');
    }
    private get logsCollection() {
      const db = getDb();
      return collection(db, 'tableLogs');
    }

    private async validateTableNumber(number: number, restaurantId: string, excludeId?: string): Promise<boolean> {
        const q = query(this.tablesCollection, where('restaurantId', '==', restaurantId), where('number', '==', number));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return true;
        if (excludeId) return snapshot.docs.every(doc => doc.id === excludeId);
        return false;
    }

    async createTable(tableData: Omit<Table, 'id'>): Promise<string> {
        if (!tableData.restaurantId) throw new Error("El ID del restaurante es obligatorio.");
        if (!await this.validateTableNumber(tableData.number, tableData.restaurantId)) {
            throw new Error(`Ya existe una mesa con el número ${tableData.number}.`);
        }

        const docRef = await addDoc(this.tablesCollection, {
            ...tableData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        await this.logAction(docRef.id, tableData.number, {
            action: 'created',
            details: `Mesa creada con capacidad para ${tableData.capacity}.`,
        }, tableData.restaurantId);

        return docRef.id;
    }

    async updateTable(tableId: string, updates: Partial<Table>): Promise<void> {
        const tableRef = doc(this.tablesCollection, tableId);
        const originalDoc = await getDoc(tableRef);

        if (!originalDoc.exists()) throw new Error("Mesa no encontrada.");
        
        const originalData = originalDoc.data() as Table;

        if (updates.number && updates.number !== originalData.number) {
            if (!await this.validateTableNumber(updates.number, originalData.restaurantId!, tableId)) {
                throw new Error(`Ya existe otra mesa con el número ${updates.number}.`);
            }
        }
        
        await updateDoc(tableRef, { ...updates, updatedAt: serverTimestamp() });

        await this.logAction(tableId, updates.number || originalData.number, {
            action: 'updated',
            details: `Mesa actualizada.`,
        }, originalData.restaurantId);
    }

    async deleteTable(tableId: string): Promise<void> {
        const tableRef = doc(this.tablesCollection, tableId);
        const tableSnap = await getDoc(tableRef);
        if(!tableSnap.exists()) return;
        const tableData = tableSnap.data() as Table;

        await deleteDoc(tableRef);

        await this.logAction(tableId, tableData.number, {
            action: 'deleted',
            details: 'Mesa eliminada permanentemente del sistema.',
        }, tableData.restaurantId);
    }

    async getTable(tableId: string): Promise<Table | null> {
        const docRef = doc(this.tablesCollection, tableId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() } as Table;
    }

    async getAllTables(restaurantId: string): Promise<Table[]> {
        if (!restaurantId) return [];
        const q = query(this.tablesCollection, where('restaurantId', '==', restaurantId), orderBy('number', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Table));
    }

    async changeTableStatus(tableId: string, newStatus: TableStatus): Promise<void> {
        const tableRef = doc(this.tablesCollection, tableId);
        const originalDoc = await getDoc(tableRef);
        if (!originalDoc.exists()) throw new Error("Mesa no encontrada.");
        
        const originalData = originalDoc.data() as Table;
        
        await updateDoc(tableRef, { status: newStatus, updatedAt: serverTimestamp() });
        
        await this.logAction(tableId, originalData.number, {
            action: 'status_changed',
            previousStatus: originalData.status,
            newStatus,
            details: `Estado cambiado de ${this.getStatusText(originalData.status)} a ${this.getStatusText(newStatus)}.`,
        }, originalData.restaurantId);
    }

    private async logAction(tableId: string, tableNumber: number, logData: Partial<TableLog>, restaurantId?: string) {
        const db = getDb();
        await addDoc(this.logsCollection, {
            tableId,
            tableNumber,
            restaurantId,
            performedBy: 'system', // Debería ser el ID del usuario actual
            createdAt: serverTimestamp(),
            ...logData
        });
    }

    // Utilidades visuales (se mantienen en el cliente)
    getStatusColor(status: TableStatus): string {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800 border-green-200';
            case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
            case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'out_of_service': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
            case 'available': return 'Disponible';
            case 'occupied': return 'Ocupada';
            case 'reserved': return 'Reservada';
            case 'out_of_service': return 'Fuera de servicio';
            default: return 'Desconocido';
        }
    }
}

export const tableService = new TableService();
