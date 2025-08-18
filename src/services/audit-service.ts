
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, serverTimestamp, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { Timestamp as FirestoreTimestamp } from 'firebase/firestore';

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
  timestamp: string; // Cambiado a string para consistencia
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
   * Convierte de forma segura varios formatos de timestamp a un string ISO.
   */
  private parseTimestamp(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (timestamp instanceof Timestamp) return timestamp.toDate().toISOString();
    if (timestamp instanceof Date) return timestamp.toISOString();
    if (typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
        return new Date(timestamp.seconds * 1000).toISOString();
    }
    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) return date.toISOString();
    }
    console.warn("Formato de fecha no reconocido, devolviendo fecha actual:", timestamp);
    return new Date().toISOString(); // Fallback
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

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
            timestamp: this.parseTimestamp(data.timestamp), // Conversión centralizada
        } as AuditLog;
    });
  }
}

export const auditService = new AuditService();
