
// src/types/plans.ts

// Interfaz principal para un plan de la landing page.
// Las fechas se definen como string para compatibilidad con la serialización.
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
  isPublic: boolean;
  isPopular?: boolean;
  order: number;
  icon: string;
  color: string;
  maxUsers?: number;
  maxProjects?: number;
  ctaText?: string;
  createdAt: string; // Corregido a string
  updatedAt: string; // Corregido a string
  createdBy: string;
  updatedBy: string;
  mp_preapproval_plan_id?: string;
}

// Interfaz para crear un nuevo plan.
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
  mp_preapproval_plan_id?: string;
}

// Interfaz para actualizar un plan existente.
export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  id: string;
}

// Interfaz para los registros de auditoría de los planes.
// La fecha se define como string.
export interface PlanAuditLog {
  id: string;
  planId: string;
  action: 'created' | 'updated' | 'deleted' | 'reordered' | 'rollback';
  userId: string;
  userEmail: string;
  timestamp: string; // Corregido a string
  previousData?: Partial<LandingPlan>;
  newData?: Partial<LandingPlan>;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
