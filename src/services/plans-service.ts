
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Plan, 
  CreatePlanRequest, 
  UpdatePlanRequest, 
  PlanHistory, 
  PlanAuditLog,
  PlanValidationError 
} from '@/types/plans';

class PlansService {
  private readonly COLLECTION_NAME = 'plans';
  private readonly HISTORY_COLLECTION = 'planHistory';
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
   * Valida los datos del plan antes de crear/actualizar
   */
  private validatePlanData(data: CreatePlanRequest | UpdatePlanRequest): PlanValidationError[] {
    const errors: PlanValidationError[] = [];

    if ('name' in data && (!data.name || data.name.trim().length < 3)) {
      errors.push({
        field: 'name',
        message: 'El nombre debe tener al menos 3 caracteres',
        code: 'INVALID_NAME'
      });
    }

    if ('price' in data && (data.price < 0 || !Number.isFinite(data.price))) {
      errors.push({
        field: 'price',
        message: 'El precio debe ser un número válido mayor o igual a 0',
        code: 'INVALID_PRICE'
      });
    }

    if ('features' in data && (!Array.isArray(data.features) || data.features.length === 0)) {
      errors.push({
        field: 'features',
        message: 'Debe incluir al menos una característica',
        code: 'INVALID_FEATURES'
      });
    }

    if ('icon' in data && !data.icon) {
      errors.push({
        field: 'icon',
        message: 'Debe seleccionar un ícono',
        code: 'INVALID_ICON'
      });
    }

    if ('color' in data && !data.color) {
      errors.push({
        field: 'color',
        message: 'Debe seleccionar un color',
        code: 'INVALID_COLOR'
      });
    }

    return errors;
  }

  /**
   * Registra una acción en el historial
   */
  private async logHistory(
    planId: string,
    action: PlanHistory['action'],
    userId: string,
    userEmail: string,
    previousData?: Partial<Plan>,
    newData?: Partial<Plan>,
    reason?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      const historyEntry: Omit<PlanHistory, 'id'> = {
        planId,
        action,
        previousData,
        newData,
        userId,
        userEmail,
        timestamp: new Date(),
        reason,
        ipAddress
      };

      await addDoc(collection(db, this.HISTORY_COLLECTION), historyEntry);
    } catch (error) {
      console.error('Error logging plan history:', error);
    }
  }

  /**
   * Registra una entrada de auditoría
   */
  private async logAudit(
    planId: string,
    action: string,
    userId: string,
    userEmail: string,
    details: Record<string, any>,
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
   * Obtiene todos los planes activos ordenados por orden
   */
  async getPlans(): Promise<Plan[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      const plans: Plan[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Plan));

      await this.logAudit('all', 'get_plans', 'system', 'system@websapmax.com', {
        count: plans.length,
        action: 'retrieved_all_active_plans'
      });

      return plans;
    } catch (error) {
      console.error('Error getting plans:', error);
      throw new Error('Error al obtener los planes. Es posible que necesite un índice compuesto en Firestore. Revise los logs de la consola de Firebase.');
    }
  }

  /**
   * Obtiene un plan por ID
   */
  async getPlanById(id: string): Promise<Plan | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      const plan: Plan = {
        id: docSnap.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency || 'USD',
        period: data.period,
        features: data.features || [],
        isActive: data.isActive,
        isPopular: data.isPopular || false,
        order: data.order || 0,
        icon: data.icon,
        color: data.color,
        maxUsers: data.maxUsers,
        maxProjects: data.maxProjects,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
        updatedBy: data.updatedBy
      };

      await this.logAudit(id, 'get_plan', 'system', 'system@websapmax.com', {
        planId: id,
        action: 'retrieved_plan'
      });

      return plan;
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
    ipAddress?: string
  ): Promise<Plan> {
    try {
      // Validar datos
      const validationErrors = this.validatePlanData(data);
      if (validationErrors.length > 0) {
        throw new Error(`Errores de validación: ${validationErrors.map(e => e.message).join(', ')}`);
      }

      // Generar slug único
      const slug = this.generateSlug(data.name);
      const isSlugUnique = await this.validateSlug(slug);
      
      if (!isSlugUnique) {
        throw new Error('Ya existe un plan con un nombre similar');
      }

      // Obtener el siguiente orden
      const existingPlans = await this.getPlans();
      const nextOrder = Math.max(...existingPlans.map(p => p.order), 0) + 1;

      const planData = {
        slug,
        name: data.name.trim(),
        description: data.description.trim(),
        price: data.price,
        currency: data.currency || 'USD',
        period: data.period,
        features: data.features,
        isActive: data.isActive ?? true,
        isPopular: data.isPopular ?? false,
        order: data.order ?? nextOrder,
        icon: data.icon,
        color: data.color,
        maxUsers: data.maxUsers,
        maxProjects: data.maxProjects,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), planData);
      
      // Log historial y auditoría
      await this.logHistory(
        docRef.id,
        'created',
        userId,
        userEmail,
        undefined,
        planData,
        'Plan creado',
        ipAddress
      );

      await this.logAudit(
        docRef.id,
        'create_plan',
        userId,
        userEmail,
        { planData, action: 'plan_created' },
        ipAddress
      );

      return {
        id: docRef.id,
        ...planData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Plan;
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
    ipAddress?: string
  ): Promise<Plan> {
    try {
      // Verificar que el plan existe
      const existingPlan = await this.getPlanById(id);
      if (!existingPlan) {
        throw new Error('Plan no encontrado');
      }

      // Validar datos
      const validationErrors = this.validatePlanData(data);
      if (validationErrors.length > 0) {
        throw new Error(`Errores de validación: ${validationErrors.map(e => e.message).join(', ')}`);
      }

      // Verificar slug único si se está cambiando el nombre
      if (data.name && data.name !== existingPlan.name) {
        const newSlug = this.generateSlug(data.name);
        const isSlugUnique = await this.validateSlug(newSlug, id);
        
        if (!isSlugUnique) {
          throw new Error('Ya existe un plan con un nombre similar');
        }
        data.slug = newSlug;
      }

      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, updateData);

      // Log historial y auditoría
      await this.logHistory(
        id,
        'updated',
        userId,
        userEmail,
        existingPlan,
        { ...existingPlan, ...updateData },
        'Plan actualizado',
        ipAddress
      );

      await this.logAudit(
        id,
        'update_plan',
        userId,
        userEmail,
        { 
          previousData: existingPlan,
          newData: updateData,
          action: 'plan_updated'
        },
        ipAddress
      );

      return await this.getPlanById(id) as Plan;
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
    ipAddress?: string
  ): Promise<void> {
    try {
      const existingPlan = await this.getPlanById(id);
      if (!existingPlan) {
        throw new Error('Plan no encontrado');
      }

      // Soft delete - marcar como inactivo
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });

      // Log historial y auditoría
      await this.logHistory(
        id,
        'deleted',
        userId,
        userEmail,
        existingPlan,
        { ...existingPlan, isActive: false },
        'Plan eliminado',
        ipAddress
      );

      await this.logAudit(
        id,
        'delete_plan',
        userId,
        userEmail,
        { 
          previousData: existingPlan,
          action: 'plan_deleted'
        },
        ipAddress
      );
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de un plan
   */
  async getPlanHistory(planId: string): Promise<PlanHistory[]> {
    try {
      const q = query(
        collection(db, this.HISTORY_COLLECTION),
        where('planId', '==', planId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const history: PlanHistory[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        history.push({
          id: doc.id,
          planId: data.planId,
          action: data.action,
          previousData: data.previousData,
          newData: data.newData,
          userId: data.userId,
          userEmail: data.userEmail,
          timestamp: data.timestamp?.toDate() || new Date(),
          reason: data.reason,
          ipAddress: data.ipAddress
        });
      });

      return history;
    } catch (error) {
      console.error('Error getting plan history:', error);
      throw new Error('Error al obtener el historial del plan');
    }
  }

  /**
   * Reordena los planes
   */
  async reorderPlans(
    planIds: string[],
    userId: string,
    userEmail: string,
    ipAddress?: string
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

      // Log auditoría
      await this.logAudit(
        'reorder',
        'reorder_plans',
        userId,
        userEmail,
        { 
          planIds,
          newOrder: planIds.map((id, index) => ({ id, order: index + 1 })),
          action: 'plans_reordered'
        },
        ipAddress
      );
    } catch (error) {
      console.error('Error reordering plans:', error);
      throw new Error('Error al reordenar los planes');
    }
  }
}

export const plansService = new PlansService();

    