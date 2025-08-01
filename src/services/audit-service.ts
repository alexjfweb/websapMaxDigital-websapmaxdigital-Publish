
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';

// Definición de la estructura de un log de auditoría
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
  previousData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}

// Interfaz para la entrada de logs
export type LogInput = Omit<AuditLog, 'id' | 'timestamp' | 'diff'>;

class AuditService {
  private readonly AUDIT_COLLECTION = 'auditLogs';

  /**
   * Elimina las claves con valor `undefined` de un objeto de forma recursiva.
   * Firestore no permite valores `undefined`.
   */
  private cleanupObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
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
      const logData: Omit<AuditLog, 'id'> = {
        ...data,
        timestamp: serverTimestamp() as Timestamp,
        ipAddress: data.ipAddress || 'not-provided', // Default value
        userAgent: data.userAgent || 'not-provided', // Default value
      };

      // Limpiar cualquier propiedad 'undefined' antes de enviar a Firestore
      const cleanedLogData = this.cleanupObject(logData);

      const docRef = await addDoc(collection(db, this.AUDIT_COLLECTION), cleanedLogData);
      return docRef.id;
    } catch (error) {
      console.error("Error al registrar el log de auditoría:", error);
      throw new Error("No se pudo registrar el log de auditoría.");
    }
  }

  /**
   * Obtiene los logs de auditoría con opciones de filtrado.
   */
  async getLogs(filters: {
    entity?: string;
    action?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
    pageLimit?: number;
  }): Promise<AuditLog[]> {
    let q = query(collection(db, this.AUDIT_COLLECTION), orderBy('timestamp', 'desc'));

    if (filters.entity) {
      q = query(q, where('entity', '==', filters.entity));
    }
    if (filters.action) {
      q = query(q, where('action', '==', filters.action));
    }
    if (filters.userId) {
      q = query(q, where('performedBy.uid', '==', filters.userId));
    }
    if (filters.startDate) {
        q = query(q, where('timestamp', '>=', filters.startDate));
    }
    if (filters.endDate) {
        q = query(q, where('timestamp', '<=', filters.endDate));
    }

    q = query(q, limit(filters.pageLimit || 50));
    
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));

    // Filtrado por searchTerm se realiza en el cliente ya que Firestore no soporta búsquedas de texto parcial complejas.
    if(filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      return logs.filter(log => 
          log.entityId.toLowerCase().includes(term) ||
          log.performedBy.email.toLowerCase().includes(term)
      );
    }
    
    return logs;
  }
}

export const auditService = new AuditService();
