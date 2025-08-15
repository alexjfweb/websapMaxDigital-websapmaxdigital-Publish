
import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  query, orderBy, onSnapshot, writeBatch, serverTimestamp, where, limit, Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auditService } from './audit-service';
import type { LandingPlan, CreatePlanRequest, UpdatePlanRequest, PlanAuditLog } from '@/types/plans';

const serializeDate = (date: any): string => {
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') {
    const d = new Date(date);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  if (date && typeof date.seconds === 'number') {
    return new Date(date.seconds * 1000).toISOString();
  }
  return new Date().toISOString();
};

const serializePlan = (id: string, data: any): LandingPlan => {
  return {
    ...data,
    id,
    createdAt: serializeDate(data.createdAt),
    updatedAt: serializeDate(data.updatedAt),
  } as LandingPlan;
};

class LandingPlansService {
  private readonly COLLECTION_NAME = 'landingPlans';
  private readonly AUDIT_COLLECTION = 'planAuditLogs';

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
  }

  private async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    const qBase = query(collection(db, this.COLLECTION_NAME), where('slug', '==', slug));
    const q = excludeId ? query(qBase, where('__name__', '!=', excludeId)) : qBase;
    const snapshot = await getDocs(q);
    return snapshot.empty;
  }

  async getPlans(): Promise<LandingPlan[]> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), where('isActive', '==', true), where('isPublic', '==', true), orderBy('order'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => serializePlan(doc.id, doc.data()));
    } catch (error) {
      console.error('Error fetching public plans:', error);
      return [];
    }
  }

  async getPlanById(id: string): Promise<LandingPlan | null> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? serializePlan(docSnap.id, docSnap.data()) : null;
  }
  
  async getPlanAuditLogs(planId: string): Promise<PlanAuditLog[]> {
    try {
      const q = query(collection(db, this.AUDIT_COLLECTION), where('planId', '==', planId), orderBy('timestamp', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id, timestamp: serializeDate(data.timestamp) } as PlanAuditLog;
      });
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }
}

export const landingPlansService = new LandingPlansService();
