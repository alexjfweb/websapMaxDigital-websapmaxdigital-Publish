
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, serverTimestamp, where, orderBy, limit } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';

// Definición de la estructura de un log de auditoría
export interface AuditLog {
  id: string;
  entity: 'landingPlans' | 'companies' | 'users' | 'tables' | 'reservations' | 'orders';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'reordered' | 'status_changed' | 'role_changed';
  performedBy: {
    uid: string;
    email: string;
  };
  timestamp: Timestamp;
  previousData?: any;
  newData?: any;
  diff?: Record<string, { from: any, to: any }>;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

// Interfaz para la entrada de logs
export type LogInput = Omit<AuditLog, 'id' | 'timestamp'>;

class AuditService {
  private readonly AUDIT_COLLECTION = 'globalAuditLogs';

  /**
   * Elimina las claves con valor `undefined` de un objeto de forma recursiva.
   * Firestore no permite valores `undefined`.
   */
  private cleanupObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Timestamp || obj instanceof Date) {
        return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanupObject(item));
    }

    const cleanedObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (value !== undefined) {
          cleanedObj[key] = this.cleanupObject(value);
        }
      }
    }
    return cleanedObj;
  }

  /**
   * Registra una nueva entrada de auditoría.
   */
  async log(data: LogInput): Promise<string> {
    try {
      // Limpiar el objeto de datos antes de enviarlo a Firestore
      const cleanedData = this.cleanupObject(data);

      const logData = {
        ...cleanedData,
        timestamp: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, this.AUDIT_COLLECTION), logData);
      return docRef.id;
    } catch (error) {
      console.error("Error al registrar el log de auditoría:", error);
      // No relanzar el error para no interrumpir el flujo principal si solo falla la auditoría.
      // En un sistema crítico, se podría manejar con una cola de reintentos.
      return 'log-failed';
    }
  }

  /**
   * Obtiene los logs de auditoría con opciones de filtrado.
   */
  async getLogs(options: { entity?: string; action?: string; limit?: number } = {}): Promise<AuditLog[]> {
    const coll = collection(db, this.AUDIT_COLLECTION);
    const queryConstraints: any[] = [orderBy('timestamp', 'desc')];
    
    if (options.entity) {
      queryConstraints.push(where('entity', '==', options.entity));
    }
    if (options.action) {
      queryConstraints.push(where('action', '==', options.action));
    }
    if (options.limit) {
      queryConstraints.push(limit(options.limit));
    }

    const q = query(coll, ...queryConstraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
  }
}

export const auditService = new AuditService();
