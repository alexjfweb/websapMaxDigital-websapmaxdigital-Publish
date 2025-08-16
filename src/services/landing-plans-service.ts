import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  writeBatch,
  query,
  orderBy,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import type { LandingPlan, CreatePlanRequest, UpdatePlanRequest, PlanAuditLog } from '@/types/plans';
import { auditService } from './audit-service';

// --- HELPER FUNCTIONS ---
const generateSlug = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

const serializeDate = (date: any): string => {
  if (!date) return new Date().toISOString();
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

const serializePlan = (id: string, data: any): LandingPlan => ({
  id,
  slug: data.slug || '',
  name: data.name || '',
  description: data.description || '',
  price: data.price ?? 0,
  currency: data.currency || 'USD',
  period: data.period || 'monthly',
  features: data.features || [],
  isActive: data.isActive ?? false,
  isPublic: data.isPublic ?? false,
  isPopular: data.isPopular ?? false,
  order: data.order ?? 99,
  icon: data.icon || 'zap',
  color: data.color || 'blue',
  maxUsers: data.maxUsers,
  maxProjects: data.maxProjects,
  ctaText: data.ctaText,
  createdAt: serializeDate(data.createdAt),
  updatedAt: serializeDate(data.updatedAt),
  createdBy: data.createdBy || 'system',
  updatedBy: data.updatedBy || 'system',
  mp_preapproval_plan_id: data.mp_preapproval_plan_id,
});

// --- SERVICE CLASS ---
class LandingPlansService {
  private readonly COLLECTION_NAME = 'landingPlans';
  private readonly AUDIT_COLLECTION = 'planAuditLogs';

  private get plansCollection() {
    return collection(db, this.COLLECTION_NAME);
  }

  private async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    const constraints = [where('slug', '==', slug)];
    if (excludeId) {
      constraints.push(where('__name__', '!=', excludeId));
    }
    const q = query(this.plansCollection, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.empty;
  }

  async getPlans(): Promise<LandingPlan[]> {
    const q = query(this.plansCollection, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => serializePlan(doc.id, doc.data()));
  }
  
  async getPlanById(id: string): Promise<LandingPlan | null> {
    if (!id) return null;
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? serializePlan(docSnap.id, docSnap.data()) : null;
  }

  async createPlan(data: CreatePlanRequest, userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<LandingPlan> {
    let slug = generateSlug(data.name);
    if (!await this.validateSlug(slug)) {
      slug = `${slug}-${Date.now()}`; // Make slug unique
    }

    const newPlanData = {
      ...data,
      slug,
      order: (await getDocs(this.plansCollection)).size,
      isActive: data.isActive ?? true,
      isPublic: data.isPublic ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userEmail,
    };

    const docRef = await addDoc(this.plansCollection, newPlanData);
    const createdPlan = await this.getPlanById(docRef.id);
    if (!createdPlan) throw new Error("Failed to retrieve plan after creation.");
    
    await this.logAudit(docRef.id, 'created', userId, userEmail, { newData: createdPlan, ipAddress, userAgent });
    return createdPlan;
  }

  async updatePlan(id: string, data: UpdatePlanRequest, userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<LandingPlan> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const originalDoc = await this.getPlanById(id);
    if (!originalDoc) throw new Error(`Plan with id ${id} not found`);

    let slug = originalDoc.slug;
    if (data.name && data.name !== originalDoc.name) {
      slug = generateSlug(data.name);
      if (!await this.validateSlug(slug, id)) {
        throw new Error(`Plan name "${data.name}" results in a duplicate slug.`);
      }
    }
    
    const updateData = { ...data, slug, updatedAt: serverTimestamp(), updatedBy: userEmail };
    await setDoc(docRef, updateData, { merge: true });

    const updatedPlan = await this.getPlanById(id);
    if (!updatedPlan) throw new Error("Failed to retrieve plan after update.");

    await this.logAudit(id, 'updated', userId, userEmail, { previousData: originalDoc, newData: updatedPlan, ipAddress, userAgent });
    return updatedPlan;
  }

  async deletePlan(id: string, userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.updatePlan(id, { isActive: false, isPublic: false }, userId, userEmail, ipAddress, userAgent);
  }

  async reorderPlans(planIds: string[], userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const batch = writeBatch(db);
    planIds.forEach((id, index) => {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      batch.update(docRef, { order: index, updatedAt: serverTimestamp() });
    });
    await batch.commit();
    await this.logAudit('system', 'reordered', userId, userEmail, { details: `Reordered ${planIds.length} plans`, ipAddress, userAgent });
  }
  
  async getPlanAuditLogs(planId: string): Promise<PlanAuditLog[]> {
    const coll = collection(db, this.AUDIT_COLLECTION);
    const q = query(coll, where('planId', '==', planId), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            timestamp: serializeDate(data.timestamp),
        } as PlanAuditLog;
    });
  }

  async rollbackPlan(planId: string, auditLogId: string, userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const auditLogRef = doc(db, this.AUDIT_COLLECTION, auditLogId);
    const auditLogSnap = await getDoc(auditLogRef);
    if (!auditLogSnap.exists()) throw new Error("Audit log not found.");
    
    const logData = auditLogSnap.data();
    if (!logData.previousData || Object.keys(logData.previousData).length === 0) {
      throw new Error("No previous data available to rollback to.");
    }

    const planRef = doc(db, this.COLLECTION_NAME, planId);
    await setDoc(planRef, { ...logData.previousData, updatedAt: serverTimestamp() }, { merge: true });

    await this.logAudit(planId, 'rollback', userId, userEmail, {
      details: `Rolled back to state from audit log ${auditLogId}`,
      newData: logData.previousData,
      ipAddress, userAgent
    });
  }

  async logAudit(planId: string, action: PlanAuditLog['action'], userId: string, userEmail: string, details: Partial<PlanAuditLog>) {
    const data = {
      planId,
      action,
      userId,
      userEmail,
      timestamp: serverTimestamp(),
      ...details,
    };
    await addDoc(collection(db, this.AUDIT_COLLECTION), data);
  }
}

export const landingPlansService = new LandingPlansService();
