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
  addDoc,
  WriteBatch,
  writeBatch
} from 'firebase/firestore';
import type { Company } from '@/types';
import { auditService } from './audit-service';

export interface CreateCompanyInput {
  name: string;
  ruc: string;
  location: string;
  email?: string;
  phone?: string;
  phoneFixed?: string;
  addressStreet?: string;
  addressNeighborhood?: string;
  addressState?: string;
  addressPostalCode?: string;
  companyType?: string;
  planId?: string;
}

const serializeCompany = (doc: any): Company => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),
    registrationDate: data.registrationDate ? new Date(data.registrationDate).toISOString() : new Date().toISOString(),
    trialEndsAt: data.trialEndsAt ? data.trialEndsAt.toDate().toISOString() : null,
  };
};

class CompanyService {
  private companiesCollection = collection(db, 'companies');

  private async isRucUnique(ruc: string, excludeId?: string): Promise<boolean> {
    const q = query(this.companiesCollection, where('ruc', '==', ruc));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return true;
    if (excludeId) return snapshot.docs.every(doc => doc.id === excludeId);
    return false;
  }

  async getCompanies(): Promise<Company[]> {
    const snapshot = await getDocs(this.companiesCollection);
    return snapshot.docs.map(serializeCompany);
  }

  async getCompanyById(id: string): Promise<Company | null> {
    if (!id) return null;
    const docRef = doc(this.companiesCollection, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return serializeCompany(docSnap);
  }
  
  async createCompany(companyData: Partial<Company>, user: { uid: string; email: string }): Promise<Company> {
    if (!companyData.name || !companyData.ruc) {
      throw new Error("El nombre de la empresa y el RUC son obligatorios.");
    }

    if (!await this.isRucUnique(companyData.ruc)) {
      throw new Error(`Ya existe una empresa con el RUC ${companyData.ruc}.`);
    }

    const newCompanyData = {
      ...companyData,
      status: companyData.status || 'pending',
      registrationDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(this.companiesCollection, newCompanyData);
    const createdCompany = await this.getCompanyById(docRef.id);

    if (!createdCompany) {
      throw new Error("No se pudo obtener la empresa después de la creación.");
    }
    
    await auditService.log({
      entity: 'companies',
      entityId: docRef.id,
      action: 'created',
      performedBy: user,
      newData: newCompanyData,
    });

    return createdCompany;
  }

  async updateCompany(companyId: string, updates: Partial<Company>, user: { uid: string; email: string }): Promise<Company> {
    const docRef = doc(this.companiesCollection, companyId);
    const originalDocSnap = await getDoc(docRef);
    
    if (!originalDocSnap.exists()) {
      throw new Error(`Empresa con ID ${companyId} no encontrada.`);
    }

    if (updates.ruc && updates.ruc !== originalDocSnap.data().ruc) {
      if (!await this.isRucUnique(updates.ruc, companyId)) {
        throw new Error(`Ya existe otra empresa con el RUC ${updates.ruc}.`);
      }
    }
    
    const originalData = serializeCompany(originalDocSnap);
    
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    const updatedCompany = await this.getCompanyById(companyId);

    if (!updatedCompany) {
      throw new Error("No se pudo obtener la empresa después de la actualización.");
    }
    
    await auditService.log({
      entity: 'companies',
      entityId: companyId,
      action: 'updated',
      performedBy: user,
      previousData: originalData,
      newData: updatedCompany,
    });

    return updatedCompany;
  }

  async deleteCompany(companyId: string, user: { uid: string; email: string }): Promise<void> {
    // Soft delete: just change status to 'inactive'
    await this.updateCompany(companyId, { status: 'inactive' }, user);
  }
}

export const companyService = new CompanyService();
