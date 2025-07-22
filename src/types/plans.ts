export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  isActive: boolean;
  isPopular?: boolean;
  order: number;
  icon: string;
  color: string;
  maxUsers?: number;
  maxProjects?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PlanHistory {
  id: string;
  planId: string;
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
  previousData?: Partial<Plan>;
  newData?: Partial<Plan>;
  userId: string;
  userEmail: string;
  timestamp: Date;
  reason?: string;
  ipAddress?: string;
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  price: number;
  currency?: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  isActive?: boolean;
  isPopular?: boolean;
  order?: number;
  icon: string;
  color: string;
  maxUsers?: number;
  maxProjects?: number;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  id: string;
}

export interface PlanResponse {
  success: boolean;
  data?: Plan | Plan[];
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PlanHistoryResponse {
  success: boolean;
  data?: PlanHistory[];
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PlanValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PlanAuditLog {
  id: string;
  planId: string;
  action: string;
  userId: string;
  userEmail: string;
  timestamp: Date;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
} 