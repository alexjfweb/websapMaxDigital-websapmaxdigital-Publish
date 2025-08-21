
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import type { Company } from '@/types';
import { auditService } from './audit-service';

// Este servicio ahora interactúa directamente con la API en lugar de con Firestore,
// para ser usado por los componentes de cliente.

const serializeCompany = (id: string, data: any): Company => {
  const companyData = data as Partial<Company>;
  return {
    ...companyData,
    id,
    createdAt: new Date(data.createdAt?.seconds * 1000 || Date.now()).toISOString(),
    updatedAt: new Date(data.updatedAt?.seconds * 1000 || Date.now()).toISOString(),
    registrationDate: new Date(data.registrationDate || Date.now()).toISOString(),
    trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt.seconds * 1000).toISOString() : null,
  } as Company;
};

class CompanyService {
  
  async getCompanies(): Promise<Company[]> {
    const response = await fetch('/api/companies');
    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }
    const result = await response.json();
    return result.data;
  }

  async getCompanyById(id: string): Promise<Company | null> {
     if (!id) return null;
    const response = await fetch(`/api/companies/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch company');
    }
    return response.json();
  }
  
  async createCompany(companyData: Partial<Company>, user: { uid: string; email: string }): Promise<{id: string}> {
    const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyData, user }),
    });
    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create company');
    }
    const result = await response.json();
    return { id: result.companyId };
  }

  async updateCompany(companyId: string, companyData: Partial<Company>, user: { uid: string; email: string }): Promise<Company> {
    const response = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyData, user }),
    });
     if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update company');
    }
    const result = await response.json();
    return result.data;
  }
}

export const companyService = new CompanyService();
export type { Company };
