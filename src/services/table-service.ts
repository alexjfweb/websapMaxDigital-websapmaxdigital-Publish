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

export interface TableReservation {
  id?: string;
  tableId: string;
  tableNumber: number;
  reservationDate: string;
  reservationTime: string;
  customerName?: string;
  customerPhone?: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: any;
  updatedAt?: any;
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
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'tables'.");
      return null;
    }
    return collection(db, 'tables');
  }
  private get reservationsCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'table_reservations'.");
      return null;
    }
    return collection(db, 'table_reservations');
  }
  private get logsCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'table_logs'.");
      return null;
    }
    return collection(db, 'table_logs');
  }

  // CRUD
  async createTable(tableData: Omit<Table, 'id' | 'createdAt' | 'updatedAt'> & { restaurantId?: string }): Promise<string> {
    const coll = this.tablesCollection;
    if (!coll) throw new Error("La base de datos no está disponible.");

    const restaurantId = typeof tableData.restaurantId === 'string' && tableData.restaurantId.trim() !== '' ? tableData.restaurantId : 'websapmax';
    // Validar unicidad de número de mesa por restaurante
    const q = query(coll, where('restaurantId', '==', restaurantId), where('number', '==', tableData.number), where('isActive', '==', true));
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error(`Ya existe una mesa con el número ${tableData.number} en este restaurante.`);
    }
    const tableWithTimestamps = {
      ...tableData,
      restaurantId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(coll, tableWithTimestamps);
    await this.createLog({
      tableId: docRef.id,
      tableNumber: tableData.number,
      action: 'created',
      details: `Mesa ${tableData.number} creada con capacidad ${tableData.capacity}`,
      performedBy: 'admin',
    });
    return docRef.id;
  }

  async updateTable(tableId: string, updates: Partial<Table>): Promise<void> {
    const coll = this.tablesCollection;
    if (!coll) throw new Error("La base de datos no está disponible.");

    const tableRef = doc(coll, tableId);
    const tableDoc = await getDoc(tableRef);
    if (!tableDoc.exists()) throw new Error('Mesa no encontrada');
    const previousData = tableDoc.data() as Table;
    // Validar unicidad si se cambia el número
    if (updates.number && updates.number !== previousData.number) {
      const q = query(coll, where('restaurantId', '==', previousData.restaurantId), where('number', '==', updates.number), where('isActive', '==', true));
      const existing = await getDocs(q);
      if (!existing.empty) {
        throw new Error(`Ya existe una mesa con el número ${updates.number} en este restaurante.`);
      }
    }
    await updateDoc(tableRef, { ...updates, updatedAt: serverTimestamp() });
    await this.createLog({
      tableId,
      tableNumber: previousData.number,
      action: 'updated',
      details: `Mesa ${previousData.number} actualizada`,
      performedBy: 'admin',
    });
  }

  async deleteTable(tableId: string): Promise<void> {
    const coll = this.tablesCollection;
    if (!coll) throw new Error("La base de datos no está disponible.");
    
    const tableRef = doc(coll, tableId);
    const tableDoc = await getDoc(tableRef);
    if (!tableDoc.exists()) throw new Error('Mesa no encontrada');
    const tableData = tableDoc.data() as Table;
    await updateDoc(tableRef, {
      isActive: false,
      status: 'out_of_service',
      updatedAt: serverTimestamp(),
    });
    await this.createLog({
      tableId,
      tableNumber: tableData.number,
      action: 'deleted',
      details: `Mesa ${tableData.number} eliminada`,
      performedBy: 'admin',
    });
  }

  async getTable(tableId: string): Promise<Table | null> {
    const coll = this.tablesCollection;
    if (!coll) return null;

    const tableRef = doc(coll, tableId);
    const tableDoc = await getDoc(tableRef);
    if (!tableDoc.exists()) return null;
    return { id: tableDoc.id, ...tableDoc.data() } as Table;
  }

  async getAllTables(restaurantId: string): Promise<Table[]> {
    const coll = this.tablesCollection;
    if (!coll) return [];

    if (!restaurantId) {
      throw new Error("El ID del restaurante es obligatorio.");
    }
    const q = query(coll, where('isActive', '==', true), where('restaurantId', '==', restaurantId), orderBy('number', 'asc'));
    
    const querySnapshot = await getDocs(q);
    
    const tables: Table[] = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.number && data.status && data.capacity) {
            tables.push({ id: doc.id, ...data } as Table);
        } else {
            console.warn(`[WARN] La mesa con ID ${doc.id} tiene datos incompletos y será omitida.`);
        }
    });
    
    return tables;
}


  // Reservas
  async reserveTable(reservationData: Omit<TableReservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const resColl = this.reservationsCollection;
    const tableColl = this.tablesCollection;
    if (!resColl || !tableColl) throw new Error("La base de datos no está disponible.");
    
    const batch = writeBatch(db);
    const reservationWithTimestamps = {
      ...reservationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const reservationRef = doc(resColl);
    batch.set(reservationRef, reservationWithTimestamps);
    const tableRef = doc(tableColl, reservationData.tableId);
    batch.update(tableRef, { status: 'reserved', updatedAt: serverTimestamp() });
    await batch.commit();
    await this.createLog({
      tableId: reservationData.tableId,
      tableNumber: reservationData.tableNumber,
      action: 'reserved',
      previousStatus: 'available',
      newStatus: 'reserved',
      details: `Mesa ${reservationData.tableNumber} reservada para ${reservationData.reservationDate} a las ${reservationData.reservationTime}`,
      performedBy: 'admin',
    });
    return reservationRef.id;
  }

  async releaseTable(tableId: string): Promise<void> {
    const tableColl = this.tablesCollection;
    const resColl = this.reservationsCollection;
    if (!tableColl || !resColl) throw new Error("La base de datos no está disponible.");
    
    const batch = writeBatch(db);
    const tableRef = doc(tableColl, tableId);
    batch.update(tableRef, { status: 'available', updatedAt: serverTimestamp() });
    // Cancelar reservas pendientes
    const reservationsQuery = query(
      resColl,
      where('tableId', '==', tableId),
      where('status', '==', 'pending')
    );
    const reservationsSnapshot = await getDocs(reservationsQuery);
    reservationsSnapshot.docs.forEach(docSnap => {
      batch.update(docSnap.ref, { status: 'cancelled', updatedAt: serverTimestamp() });
    });
    await batch.commit();
    const tableDoc = await getDoc(tableRef);
    const tableData = tableDoc.data() as Table;
    await this.createLog({
      tableId,
      tableNumber: tableData.number,
      action: 'released',
      previousStatus: 'reserved',
      newStatus: 'available',
      details: `Mesa ${tableData.number} liberada`,
      performedBy: 'admin',
    });
  }

  async changeTableStatus(tableId: string, newStatus: TableStatus): Promise<void> {
    const coll = this.tablesCollection;
    if (!coll) throw new Error("La base de datos no está disponible.");

    const tableRef = doc(coll, tableId);
    const tableDoc = await getDoc(tableRef);
    if (!tableDoc.exists()) throw new Error('Mesa no encontrada');
    const previousData = tableDoc.data() as Table;
    await updateDoc(tableRef, { status: newStatus, updatedAt: serverTimestamp() });
    await this.createLog({
      tableId,
      tableNumber: previousData.number,
      action: 'status_changed',
      previousStatus: previousData.status,
      newStatus,
      details: `Estado de mesa ${previousData.number} cambiado de ${previousData.status} a ${newStatus}`,
      performedBy: 'admin',
    });
  }

  async getTableReservations(tableId?: string): Promise<TableReservation[]> {
    const coll = this.reservationsCollection;
    if (!coll) return [];

    let q = query(coll, orderBy('reservationDate', 'desc'), orderBy('reservationTime', 'desc'));
    if (tableId) {
      q = query(coll, where('tableId', '==', tableId), orderBy('reservationDate', 'desc'), orderBy('reservationTime', 'desc'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TableReservation[];
  }

  // Logs
  private async createLog(logData: Omit<TableLog, 'id' | 'createdAt'> & { restaurantId?: string }): Promise<void> {
    const coll = this.logsCollection;
    if (!coll) return;

    const logWithRestaurant = logData.restaurantId
      ? { ...logData, restaurantId: logData.restaurantId, createdAt: serverTimestamp() }
      : { ...logData, createdAt: serverTimestamp() };
    await addDoc(coll, logWithRestaurant);
  }

  async getTableLogs(tableId: string): Promise<TableLog[]> {
    const coll = this.logsCollection;
    if (!coll) return [];

    if (!tableId) {
      throw new Error("El ID de la mesa es obligatorio.");
    }
    const q = query(
      coll,
      where('tableId', '==', tableId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TableLog[];
  }

  // Utilidades visuales
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
