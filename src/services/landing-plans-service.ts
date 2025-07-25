
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  where,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auditService } from './audit-service';

// Tipos para los planes de suscripción
export interface LandingPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  isActive: boolean;
  isPublic: boolean; // Campo para visibilidad pública
  isPopular?: boolean;
  order: number;
  icon: string;
  color: string;
  maxUsers?: number;
  maxProjects?: number;
  ctaText?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  price: number;
  currency?: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  isActive?: boolean;
  isPublic?: boolean;
  isPopular?: boolean;
  order?: number;
  icon: string;
  color: string;
  maxUsers?: number;
  maxProjects?: number;
  ctaText?: string;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  id: string;
}

export interface PlanAuditLog {
  id: string;
  planId: string;
  action: 'created' | 'updated' | 'deleted' | 'reordered' | 'rollback';
  userId: string;
  userEmail: string;
  timestamp: Date;
  previousData?: Partial<LandingPlan>;
  newData?: Partial<LandingPlan>;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

class LandingPlansService {
  private readonly COLLECTION_NAME = 'landingPlans';
  private readonly AUDIT_COLLECTION = 'planAuditLogs';

  /**
   * Genera un slug único basado en el nombre del plan
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Valida que el slug sea único
   */
  private async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    const q = excludeId 
      ? query(collection(db, this.COLLECTION_NAME), where('slug', '==', slug), where('__name__', '!=', excludeId))
      : query(collection(db, this.COLLECTION_NAME), where('slug', '==', slug));
    
    const snapshot = await getDocs(q);
    return snapshot.empty;
  }

  /**
   * Valida los datos del plan
   */
  private parseTimestamp(timestamp: any): Date {
    if (!timestamp) {
      return new Date();
    }
    
    // Si es un Timestamp de Firestore
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    
    // Si es un string de fecha
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    
    // Si es un número (timestamp en milisegundos)
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    // Si es un objeto Date
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // Por defecto, fecha actual
    return new Date();
  }

  private validatePlanData(data: CreatePlanRequest | UpdatePlanRequest): string[] {
    const errors: string[] = [];

    if ('name' in data && (!data.name || data.name.trim().length < 3)) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    if ('price' in data && (data.price === undefined || data.price < 0 || !Number.isFinite(data.price))) {
      errors.push('El precio debe ser un número válido mayor o igual a 0');
    }

    if ('features' in data && (!Array.isArray(data.features) || data.features.length === 0)) {
      errors.push('Debe incluir al menos una característica');
    }

    if ('icon' in data && !data.icon) {
      errors.push('Debe seleccionar un ícono');
    }

    if ('color' in data && !data.color) {
      errors.push('Debe seleccionar un color');
    }

    return errors;
  }

  /**
   * Registra una entrada de auditoría
   */
  public async logAudit(
    planId: string,
    action: PlanAuditLog['action'],
    userId: string,
    userEmail: string,
    details: Record<string, any>,
    previousData?: Partial<LandingPlan>,
    newData?: Partial<LandingPlan>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const auditEntry: Omit<PlanAuditLog, 'id'> = {
        planId,
        action,
        userId,
        userEmail,
        timestamp: new Date(),
        previousData,
        newData,
        details,
        ipAddress: ipAddress || 'localhost',
        userAgent: userAgent || 'system'
      };

      await addDoc(collection(db, this.AUDIT_COLLECTION), auditEntry);
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }

  /**
   * Obtiene todos los planes públicos y activos ordenados
   */
  async getPlans(): Promise<LandingPlan[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME), 
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const plans: LandingPlan[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Lógica de filtrado resiliente: si isPublic o isActive no están definidos, se asumen como true.
        const isActive = data.isActive !== false; // Activo a menos que sea explícitamente false
        const isPublic = data.isPublic !== false; // Público a menos que sea explícitamente false

        if (isActive && isPublic && data.name && data.price !== undefined) {
            plans.push({
                id: doc.id,
                slug: data.slug,
                name: data.name,
                description: data.description,
                price: data.price || 0,
                currency: data.currency || 'USD',
                period: data.period,
                features: data.features || [],
                isActive: data.isActive,
                isPublic: data.isPublic,
                isPopular: data.isPopular || false,
                order: data.order || 0,
                icon: data.icon,
                color: data.color,
                maxUsers: data.maxUsers,
                maxProjects: data.maxProjects,
                ctaText: data.ctaText || 'Comenzar Prueba Gratuita',
                createdAt: this.parseTimestamp(data.createdAt),
                updatedAt: this.parseTimestamp(data.updatedAt),
                createdBy: data.createdBy,
                updatedBy: data.updatedBy
            });
        }
      });
      
      return plans;
    } catch (error) {
      console.error('Error getting plans:', error);
      throw new Error('Error al obtener los planes');
    }
  }

  /**
   * Suscripción en tiempo real a los planes públicos
   */
  subscribeToPlans(callback: (plans: LandingPlan[]) => void, onError: (error: Error) => void): () => void {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      orderBy('order', 'asc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans: LandingPlan[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const isActive = data.isActive !== false;
        const isPublic = data.isPublic !== false;

        if (isActive && isPublic) {
            plans.push({
              id: doc.id,
              slug: data.slug,
              name: data.name,
              description: data.description,
              price: data.price || 0,
              currency: data.currency || 'USD',
              period: data.period,
              features: data.features || [],
              isActive: data.isActive,
              isPublic: data.isPublic,
              isPopular: data.isPopular || false,
              order: data.order || 0,
              icon: data.icon,
              color: data.color,
              maxUsers: data.maxUsers,
              maxProjects: data.maxProjects,
              ctaText: data.ctaText || 'Comenzar Prueba Gratuita',
              createdAt: this.parseTimestamp(data.createdAt),
              updatedAt: this.parseTimestamp(data.updatedAt),
              createdBy: data.createdBy,
              updatedBy: data.updatedBy
            });
        }
      });
      callback(plans);
    }, (error) => {
      console.error("Error en la suscripción a los planes:", error);
      onError(error);
    });
  
    return unsubscribe;
  }

  /**
   * Obtiene un plan por ID
   */
  async getPlanById(id: string): Promise<LandingPlan | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        price: data.price || 0,
        currency: data.currency || 'USD',
        period: data.period,
        features: data.features || [],
        isActive: data.isActive !== false,
        isPublic: data.isPublic === true,
        isPopular: data.isPopular || false,
        order: data.order || 0,
        icon: data.icon,
        color: data.color,
        maxUsers: data.maxUsers,
        maxProjects: data.maxProjects,
        ctaText: data.ctaText || 'Comenzar Prueba Gratuita',
        createdAt: this.parseTimestamp(data.createdAt),
        updatedAt: this.parseTimestamp(data.updatedAt),
        createdBy: data.createdBy,
        updatedBy: data.updatedBy
      };
    } catch (error) {
      console.error('Error getting plan by ID:', error);
      throw new Error('Error al obtener el plan');
    }
  }

  /**
   * Crea un nuevo plan
   */
  async createPlan(
    data: CreatePlanRequest,
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LandingPlan> {
    try {
      // Validar datos
      const errors = this.validatePlanData(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Generar slug único
      const slug = this.generateSlug(data.name);
      const isSlugUnique = await this.validateSlug(slug);
      if (!isSlugUnique) {
        throw new Error(`Ya existe un plan con el nombre "${data.name}"`);
      }

      // Obtener el siguiente orden
      const q = query(collection(db, this.COLLECTION_NAME), orderBy('order', 'desc'), limit(1));
      const lastPlanSnap = await getDocs(q);
      const lastOrder = lastPlanSnap.empty ? 0 : lastPlanSnap.docs[0].data().order;
      const nextOrder = lastOrder + 1;

      const planData = {
        slug,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency || 'USD',
        period: data.period,
        features: data.features,
        isActive: data.isActive !== false,
        isPublic: data.isPublic !== false,
        isPopular: data.isPopular || false,
        order: data.order || nextOrder,
        icon: data.icon,
        color: data.color,
        maxUsers: data.maxUsers,
        maxProjects: data.maxProjects,
        ctaText: data.ctaText || 'Comenzar Prueba Gratuita',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), planData);
      
      const newData = { id: docRef.id, ...planData, createdAt: new Date(), updatedAt: new Date() } as LandingPlan;

      // Log de auditoría
      await auditService.log({
        entity: 'landingPlans',
        entityId: docRef.id,
        action: 'created',
        performedBy: { uid: userId, email: userEmail },
        newData: newData,
        ipAddress,
        userAgent
      });


      return newData;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  /**
   * Actualiza un plan existente
   */
  async updatePlan(
    id: string,
    data: UpdatePlanRequest,
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LandingPlan> {
    try {
      // Obtener plan actual
      const currentPlan = await this.getPlanById(id);
      if (!currentPlan) {
        throw new Error('Plan no encontrado');
      }

      // Validar datos
      const errors = this.validatePlanData(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Validar slug si cambió el nombre
      if (data.name && data.name !== currentPlan.name) {
        const newSlug = this.generateSlug(data.name);
        const isSlugUnique = await this.validateSlug(newSlug, id);
        if (!isSlugUnique) {
          throw new Error(`Ya existe un plan con el nombre "${data.name}"`);
        }
        (data as any).slug = newSlug;
      }

      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, updateData);

      const newData = { ...currentPlan, ...updateData, updatedAt: new Date() };

      // Log de auditoría
      await auditService.log({
        entity: 'landingPlans',
        entityId: id,
        action: 'updated',
        performedBy: { uid: userId, email: userEmail },
        previousData: currentPlan,
        newData,
        ipAddress,
        userAgent
      });


      return await this.getPlanById(id) as LandingPlan;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  /**
   * Elimina un plan (soft delete)
   */
  async deletePlan(
    id: string,
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const currentPlan = await this.getPlanById(id);
      if (!currentPlan) {
        throw new Error('Plan no encontrado');
      }

      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });

      // Log de auditoría
      await auditService.log({
        entity: 'landingPlans',
        entityId: id,
        action: 'deleted',
        performedBy: { uid: userId, email: userEmail },
        previousData: currentPlan,
        newData: { ...currentPlan, isActive: false },
        ipAddress,
        userAgent
      });

    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  /**
   * Reordena los planes
   */
  async reorderPlans(
    planIds: string[],
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      planIds.forEach((planId, index) => {
        const docRef = doc(db, this.COLLECTION_NAME, planId);
        batch.update(docRef, {
          order: index + 1,
          updatedAt: serverTimestamp(),
          updatedBy: userId
        });
      });

      await batch.commit();

      // Log de auditoría
      await auditService.log({
        entity: 'landingPlans',
        entityId: 'multiple',
        action: 'reordered',
        performedBy: { uid: userId, email: userEmail },
        newData: { planIds, newOrder: planIds.map((id, index) => ({ id, order: index + 1 })) },
        ipAddress,
        userAgent
      });

    } catch (error) {
      console.error('Error reordering plans:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de auditoría de un plan
   */
  async getPlanAuditLogs(planId: string): Promise<PlanAuditLog[]> {
    try {
      const q = query(
        collection(db, this.AUDIT_COLLECTION),
        where('planId', '==', planId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const logs: PlanAuditLog[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          planId: data.planId,
          action: data.action,
          userId: data.userId,
          userEmail: data.userEmail,
          timestamp: data.timestamp?.toDate() || new Date(),
          previousData: data.previousData,
          newData: data.newData,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        });
      });

      return logs;
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw new Error('Error al obtener el historial');
    }
  }

  /**
   * Hace rollback a una versión anterior del plan
   */
  async rollbackPlan(
    planId: string,
    auditLogId: string,
    userId: string,
    userEmail: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LandingPlan> {
    try {
      // Obtener el log de auditoría
      const auditLogRef = doc(db, this.AUDIT_COLLECTION, auditLogId);
      const auditLogSnap = await getDoc(auditLogRef);
      
      if (!auditLogSnap.exists()) {
        throw new Error('Log de auditoría no encontrado');
      }

      const auditLog = auditLogSnap.data() as PlanAuditLog;
      
      if (auditLog.planId !== planId) {
        throw new Error('El log de auditoría no corresponde a este plan');
      }

      if (!auditLog.previousData) {
        throw new Error('No hay datos anteriores para hacer rollback');
      }

      // Aplicar rollback
      const docRef = doc(db, this.COLLECTION_NAME, planId);
      await updateDoc(docRef, {
        ...auditLog.previousData,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });

      // Log de auditoría del rollback
      await this.logAudit(
        planId,
        'rollback',
        userId,
        userEmail,
        { 
          rollback: true, 
          rollbackToAuditLog: auditLogId,
          rollbackData: auditLog.previousData 
        },
        undefined,
        auditLog.previousData,
        ipAddress,
        userAgent
      );

      return await this.getPlanById(planId) as LandingPlan;
    } catch (error) {
      console.error('Error rolling back plan:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const landingPlansService = new LandingPlansService();
