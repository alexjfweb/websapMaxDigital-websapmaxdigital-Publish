

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
  deleteDoc,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { LandingPlan, CreatePlanRequest, UpdatePlanRequest, PlanAuditLog } from '@/types/plans';
import { auditService } from './audit-service';
import { generateSlug, serializeDate } from '@/lib/utils';


// --- HELPER FUNCTIONS ---
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
  createdAt: serializeDate(data.createdAt)!,
  updatedAt: serializeDate(data.updatedAt)!,
  createdBy: data.createdBy || 'system',
  updatedBy: data.updatedBy || 'system',
  mp_preapproval_plan_id: data.mp_preapproval_plan_id,
});

// Función para limpiar un objeto de valores 'undefined' antes de enviarlo a Firestore
const cleanupObject = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Timestamp || obj instanceof Date) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => cleanupObject(item));
    }
    const cleanedObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (value !== undefined) {
                cleanedObj[key] = cleanupObject(value);
            }
        }
    }
    return cleanedObj;
};


class LandingPlansService {
  private readonly COLLECTION_NAME = 'landingPlans';
  private readonly AUDIT_COLLECTION = 'planAuditLogs';
  
  private getPlansCollection() {
    return collection(getDb(), this.COLLECTION_NAME);
  }

  private getAuditCollection() {
      return collection(getDb(), this.AUDIT_COLLECTION);
  }

  private async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    const coll = this.getPlansCollection();
    const q = query(coll, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (excludeId) {
        return snapshot.docs.every(doc => doc.id === excludeId);
    }
    return snapshot.empty;
  }

  // Obtiene TODOS los planes, para el panel de admin, sin ordenar desde la BD
  async getPlans(): Promise<LandingPlan[]> {
    const coll = this.getPlansCollection();
    const snapshot = await getDocs(coll); // Consulta simple sin 'orderBy'
    return snapshot.docs.map(doc => serializePlan(doc.id, doc.data()));
  }

  // Obtiene solo los planes públicos y activos para la landing page
  async getPublicPlans(): Promise<LandingPlan[]> {
    const coll = this.getPlansCollection();
    // Esta consulta ahora funcionará gracias a las reglas de Firestore
    const q = query(coll, where('isActive', '==', true), where('isPublic', '==', true), orderBy('order', 'asc'));
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => serializePlan(doc.id, doc.data()));
  }
  
  async getPlanById(id: string): Promise<LandingPlan | null> {
    if (!id) return null;
    const coll = this.getPlansCollection();
    const docRef = doc(coll, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? serializePlan(docSnap.id, docSnap.data()) : null;
  }
  
  async getPlanBySlug(slug: string): Promise<LandingPlan | null> {
    if (!slug) return null;
    const coll = this.getPlansCollection();
    const q = query(coll, where('slug', '==', slug), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        console.warn(`[getPlanBySlug] No active plan found for slug: ${slug}`);
        return null;
    }
    const docSnap = snapshot.docs[0];
    return serializePlan(docSnap.id, docSnap.data());
  }


  async createPlan(data: CreatePlanRequest, userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<LandingPlan> {
    let slug = generateSlug(data.name);
    if (!await this.validateSlug(slug)) {
      slug = `${slug}-${Date.now()}`;
    }

    const coll = this.getPlansCollection();
    
    const newPlanData = {
      ...data,
      slug,
      order: data.order ?? 999,
      isActive: data.isActive ?? true,
      isPublic: data.isPublic ?? true, // CORRECCIÓN: Por defecto es público
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userEmail,
    };

    const docRef = await addDoc(coll, newPlanData);
    const createdPlan = await this.getPlanById(docRef.id);
    if (!createdPlan) throw new Error("Failed to retrieve plan after creation.");
    
    await auditService.log({
      entity: 'landingPlans',
      entityId: docRef.id,
      action: 'created',
      performedBy: { uid: userId, email: userEmail },
      newData: cleanupObject(createdPlan),
      ipAddress,
      userAgent
    });
    return createdPlan;
  }

  async updatePlan(id: string, data: UpdatePlanRequest, userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<LandingPlan> {
    const coll = this.getPlansCollection();
    const docRef = doc(coll, id);
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

    await auditService.log({
      entity: 'landingPlans',
      entityId: id,
      action: 'updated',
      performedBy: { uid: userId, email: userEmail },
      previousData: cleanupObject(originalDoc),
      newData: cleanupObject(updatedPlan),
      ipAddress,
      userAgent
    });
    return updatedPlan;
  }

  async deletePlan(id: string, userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const coll = this.getPlansCollection();
    const docRef = doc(coll, id);
    const originalDoc = await this.getPlanById(id);

    if (!originalDoc) {
      throw new Error(`Plan with id ${id} not found.`);
    }

    // CORRECCIÓN: En lugar de borrar, se desactiva y se hace no público.
    await this.updatePlan(id, { isActive: false, isPublic: false }, userId, userEmail);

    await auditService.log({
        entity: 'landingPlans',
        entityId: id,
        action: 'deleted',
        performedBy: { uid: userId, email: userEmail },
        previousData: cleanupObject(originalDoc),
        details: `Plan "${originalDoc.name}" marcado como inactivo y no público.`,
        ipAddress,
        userAgent
    });
  }

  async reorderPlans(planIds: string[], userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const batch = writeBatch(getDb());
    const coll = this.getPlansCollection();

    planIds.forEach((id, index) => {
      const docRef = doc(coll, id);
      batch.update(docRef, { order: index, updatedAt: serverTimestamp() });
    });
    await batch.commit();
    await auditService.log({
      entity: 'landingPlans',
      entityId: 'system',
      action: 'reordered',
      performedBy: { uid: userId, email: userEmail },
      details: `Reordered ${planIds.length} plans`,
      ipAddress,
      userAgent
    });
  }
  
  async getPlanAuditLogs(planId: string): Promise<PlanAuditLog[]> {
    const coll = this.getAuditCollection();
    const q = query(coll, where('planId', '==', planId), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            timestamp: serializeDate(data.timestamp)!,
        } as PlanAuditLog;
    });
  }

  async rollbackPlan(planId: string, auditLogId: string, userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const auditColl = this.getAuditCollection();
    const auditLogRef = doc(auditColl, auditLogId);
    const auditLogSnap = await getDoc(auditLogRef);
    if (!auditLogSnap.exists()) throw new Error("Audit log not found.");
    
    const logData = auditLogSnap.data();
    if (!logData.previousData || Object.keys(logData.previousData).length === 0) {
      throw new Error("No previous data available to rollback to.");
    }

    const planColl = this.getPlansCollection();
    const planRef = doc(planColl, planId);
    await setDoc(planRef, { ...logData.previousData, updatedAt: serverTimestamp() }, { merge: true });

    await auditService.log({
      entity: 'landingPlans',
      entityId: planId,
      action: 'rollback' as any, // 'rollback' es una acción personalizada
      performedBy: { uid: userId, email: userEmail },
      details: `Rolled back to state from audit log ${auditLogId}`,
      newData: logData.previousData,
      ipAddress,
      userAgent
    });
  }
  
  async initializeDefaultPlans(userId: string, userEmail: string): Promise<string> {
    const plansSnapshot = await getDocs(this.getPlansCollection());
    if (plansSnapshot.empty) {
      console.log('No existen planes, creando planes por defecto...');
      const defaultPlans: CreatePlanRequest[] = [
        {
            name: 'Plan Gratis Lite',
            slug: 'plan-gratis-lite',
            description: 'Una versión gratuita y limitada para siempre después de cualquier prueba.',
            price: 0,
            currency: 'USD',
            period: 'lifetime',
            features: ['5 Mesas', '5 Empleados', '10 Reservas/mes', 'Menú Digital Básico'],
            isActive: true,
            isPublic: false, // Este plan no debe ser elegible por el usuario
            order: 99,
            icon: 'zap',
            color: 'gray',
            maxUsers: 5,
            maxProjects: 5,
            ctaText: 'Asignado Automáticamente'
        },
        {
          name: 'Plan Básico',
          slug: 'plan-basico',
          description: 'Ideal para pequeños negocios que empiezan a digitalizarse.',
          price: 10,
          currency: 'USD',
          period: 'monthly',
          features: ['20 Mesas', '10 Empleados', '50 Reservas/mes', 'Menú Digital con QR', 'Gestión de Pedidos'],
          isActive: true,
          isPublic: true,
          isPopular: false,
          order: 1,
          icon: 'zap',
          color: 'blue',
          maxUsers: 10,
          maxProjects: 20,
          ctaText: 'Empezar Ahora'
        },
        {
          name: 'Emprendedor',
          slug: 'plan-emprendedor',
          description: 'La solución completa para restaurantes en crecimiento.',
          price: 25,
          currency: 'USD',
          period: 'monthly',
          features: ['Mesas Ilimitadas', 'Empleados Ilimitados', 'Reservas Ilimitadas', 'Personalización de Menú', 'Soporte Prioritario'],
          isActive: true,
          isPublic: true,
          isPopular: true,
          order: 2,
          icon: 'star',
          color: 'green',
          maxUsers: -1,
          maxProjects: -1,
          ctaText: 'Elegir Plan',
          mp_preapproval_plan_id: '5865c85c7a444d329fe276aa92ad248c',
        },
        {
            name: 'Pro Plus Ilimitado',
            slug: 'plan-pro-plus-ilimitado',
            description: 'Funcionalidades avanzadas y analítica para grandes operaciones.',
            price: 50,
            currency: 'USD',
            period: 'monthly',
            features: ['Todo en Emprendedor', 'Analítica Avanzada', 'Integración con APIs', 'Asesor Personalizado'],
            isActive: true,
            isPublic: true,
            isPopular: false,
            order: 3,
            icon: 'gem',
            color: 'purple',
            maxUsers: -1,
            maxProjects: -1,
            ctaText: 'Contactar a Ventas',
            mp_preapproval_plan_id: '9acc8d140f044537bfd13b31613b1af8',
        }
      ];

      for (const planData of defaultPlans) {
        await this.createPlan(planData, userId, userEmail);
      }
      return 'Planes por defecto creados exitosamente.';
    }
    return 'Los planes ya existen, no se requiere inicialización.';
  }
}

export const landingPlansService = new LandingPlansService();