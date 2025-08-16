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
import { dishService } from './dish-service';

export type CreateCompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'registrationDate' | 'status' | 'planId' | 'subscriptionStatus'>;

const serializeDate = (date: any): string | null => {
  if (!date) return null;
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString();
      }
  }
  if (date && typeof date.seconds === 'number') {
    return new Date(date.seconds * 1000).toISOString();
  }
  return (typeof date === 'string') ? date : null;
};

const serializeCompany = (id: string, data: any): Company => {
  const companyData = data as Partial<Company>;
  return {
    ...companyData,
    id,
    createdAt: serializeDate(companyData.createdAt) || new Date().toISOString(),
    updatedAt: serializeDate(companyData.updatedAt) || new Date().toISOString(),
    registrationDate: serializeDate(companyData.registrationDate) || new Date().toISOString(),
    trialEndsAt: serializeDate(companyData.trialEndsAt),
  } as Company;
};

class CompanyService {
  private get companiesCollection() {
    if (!db) throw new Error("Database not available");
    return collection(db, 'companies');
  }

  async getCompanies(): Promise<Company[]> {
    const q = query(this.companiesCollection, where("status", "in", ["active", "pending", "inactive"]));
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => serializeCompany(doc.id, doc.data()));
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  async getCompanyById(id: string): Promise<Company | null> {
    if (!id) return null;
    const docRef = doc(this.companiesCollection, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? serializeCompany(docSnap.id, docSnap.data()) : null;
  }
  
  async createCompany(companyData: CreateCompanyInput, user: { uid: string; email: string }): Promise<Company> {
    if (!companyData.name || !companyData.ruc) {
      throw new Error("Company name and RUC are required.");
    }
    
    const timestamp = serverTimestamp();
    const docRef = await addDoc(this.companiesCollection, {
      ...companyData,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
      registrationDate: timestamp,
    });
    
    await dishService.createSampleDishesForCompany(docRef.id);
    
    const newCompany = await this.getCompanyById(docRef.id);
    if (!newCompany) throw new Error("Failed to retrieve newly created company.");
    
    await auditService.log({
      entity: 'companies',
      entityId: docRef.id,
      action: 'created',
      performedBy: user,
      newData: newCompany,
    });
    
    return newCompany;
  }

  async updateCompany(companyId: string, companyData: Partial<Company>, user: { uid: string; email: string }): Promise<Company> {
    const docRef = doc(this.companiesCollection, companyId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Company does not exist.");
    
    const previousData = serializeCompany(docSnap.id, docSnap.data());
    
    await updateDoc(docRef, {
      ...companyData,
      updatedAt: serverTimestamp(),
    });

    const updatedCompany = await this.getCompanyById(companyId);
    if (!updatedCompany) throw new Error("Failed to retrieve company after update.");

    await auditService.log({
      entity: 'companies',
      entityId: companyId,
      action: 'updated',
      performedBy: user,
      previousData,
      newData: updatedCompany,
    });

    return updatedCompany;
  }
}

export const companyService = new CompanyService();
