import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
export type LogInput = Omit<AuditLog, 'id' | 'timestamp'>;

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
      const logData = {
        ...data,
        timestamp: serverTimestamp(),
      };

      // Limpiar cualquier propiedad 'undefined' antes de enviar a Firestore
      const cleanedLogData = this.cleanupObject(logData);

      const docRef = await addDoc(collection(db, this.AUDIT_COLLECTION), cleanedLogData);
      return docRef.id;
    } catch (error) {
      console.error("Error al registrar el log de auditoría:", error);
      // No relanzar el error para no interrumpir flujos críticos como el registro
      return '';
    }
  }
}

export const auditService = new AuditService();
