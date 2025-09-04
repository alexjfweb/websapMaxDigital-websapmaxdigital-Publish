

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
  writeBatch,
  runTransaction,
  type Firestore
} from 'firebase/firestore';
import type { Company, User } from '@/types';
import { auditService } from './audit-service';
import { serializeDate } from '@/lib/utils';
import { getDb } from '@/lib/firebase-lazy';

const serializeCompany = (doc: any): Company => {
  const data = doc.data();
  // Usar la nueva utilidad para serializar fechas de forma segura
  return {
    id: doc.id,
    ...data,
    createdAt: serializeDate(data.createdAt),
    updatedAt: serializeDate(data.updatedAt),
    registrationDate: serializeDate(data.registrationDate) || new Date().toISOString(),
    trialEndsAt: serializeDate(data.trialEndsAt),
  };
};

class CompanyService {
  
  async isRucUnique(ruc: string, excludeId?: string): Promise<boolean> {
    const db  = getDb();
    const companiesCollection = collection(db, 'companies');
    const q = query(companiesCollection, where('ruc', '==', ruc));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return true;
    if (excludeId) return snapshot.docs.every(doc => doc.id === excludeId);
    return false;
  }

  async getCompanies(): Promise<Company[]> {
    const db = getDb();
    const companiesCollection = collection(db, 'companies');
    const snapshot = await getDocs(companiesCollection);
    return snapshot.docs.map(serializeCompany);
  }

  async getCompanyById(id: string): Promise<Company | null> {
    if (!id) return null;
    const db = getDb();
    const companiesCollection = collection(db, 'companies');
    const docRef = doc(companiesCollection, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return serializeCompany(docSnap);
  }
  
  async createCompany(companyData: Partial<Company>, user: { uid: string; email: string }): Promise<Company> {
    const db = getDb();
    const companiesCollection = collection(db, 'companies');
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
    
    const docRef = await addDoc(companiesCollection, newCompanyData);
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

  async createCompanyWithAdminUser(
    companyData: Partial<Omit<Company, 'id'>>,
    adminUserData: Partial<Omit<User, 'id'>>,
    isSuperAdminFlow: boolean = false
  ): Promise<{ companyId: string | null; userId: string }> {
    const firestore = getDb();
    
    return runTransaction(firestore, async (transaction) => {
      // DEBUG: Verificar todos los datos antes del error
      console.log('=== DEBUGGING LÍNEA POR LÍNEA ===');
      console.log('1. companyData:', JSON.stringify(companyData, null, 2));
      console.log('2. adminUserData:', JSON.stringify(adminUserData, null, 2));
      console.log('3. isSuperAdminFlow:', isSuperAdminFlow);
      
      // Esta es aproximadamente la línea 118 - AÑADIR DEBUG AQUÍ
      console.log('4. Antes de obtener userId...');
      const userId = adminUserData?.uid;
      console.log('5. userId obtenido:', userId);
      
      if (!userId) {
          throw new Error('userId es undefined - adminUserData.uid no existe');
      }
      
      let companyId: string | null = null;
      
      const companiesColRef = collection(firestore, 'companies');
      const usersColRef = collection(firestore, 'users');

      // Validar RUC si no es superadmin
      if (!isSuperAdminFlow && companyData.ruc) {
          const rucQuery = query(companiesColRef, where('ruc', '==', companyData.ruc));
          const rucSnapshot = await transaction.get(rucQuery);
          if (!rucSnapshot.empty) {
              throw new Error(`El RUC "${companyData.ruc}" ya está registrado.`);
          }
      }

      // Crear compañía si no es superadmin
      if (!isSuperAdminFlow) {
          const companyDocRef = doc(companiesColRef); 
          companyId = companyDocRef.id;

          const newCompanyData = {
              ...companyData,
              status: 'active',
              subscriptionStatus: companyData.planId && companyData.planId !== 'plan-gratuito' ? 'pending_payment' : 'trialing',
              trialEndsAt: companyData.planId && companyData.planId !== 'plan-gratuito' ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              registrationDate: new Date().toISOString(),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
          };
          transaction.set(companyDocRef, newCompanyData);
      }

      // Crear el documento del usuario
      const userDocRef = doc(usersColRef, userId);
      const newUserDoc: Omit<User, 'id'> = {
          uid: userId,
          email: adminUserData.email!,
          firstName: adminUserData.firstName!,
          lastName: adminUserData.lastName!,
          role: adminUserData.role!,
          companyId: companyId || undefined,
          businessName: companyData.name || '',
          status: 'active',
          registrationDate: new Date().toISOString(),
          isActive: true,
          avatarUrl: adminUserData.avatarUrl || `https://placehold.co/100x100.png?text=${adminUserData.firstName!.charAt(0)}`,
          username: adminUserData.email!.split('@')[0],
      };
      transaction.set(userDocRef, newUserDoc);

      return { companyId, userId };
    });
  }

  async updateCompany(companyId: string, updates: Partial<Company>, user: { uid: string; email: string }): Promise<Company> {
    const db = getDb();
    const companiesCollection = collection(db, 'companies');
    const docRef = doc(companiesCollection, companyId);
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
    await this.updateCompany(companyId, { status: 'inactive' }, user);
  }
}

export const companyService = new CompanyService();
