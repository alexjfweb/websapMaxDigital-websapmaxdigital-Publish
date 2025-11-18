
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
  maxUsers: number;
  maxProjects: number;
  maxOrders: number;
  maxReservations: number;
  maxDishes: number; // Añadido
  maxSuggestions: number; // Añadido
  ctaText?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  mp_preapproval_plan_id?: string;
}

export interface CreatePlanRequest {
  name: string;
  slug?: string;
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
  maxUsers: number;
  maxProjects: number;
  maxOrders: number;
  maxReservations: number;
  maxDishes: number; // Añadido
  maxSuggestions: number; // Añadido
  ctaText?: string;
  mp_preapproval_plan_id?: string;
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
  timestamp: string;
  previousData?: Partial<LandingPlan>;
  newData?: Partial<LandingPlan>;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
