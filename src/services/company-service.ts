
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
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import type { Company, User } from '@/types';
import { auditService } from './audit-service';
import { serializeDate } from '@/lib/utils'; // Importar la nueva utilidad

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
  private get companiesCollection() {
    return collection(db, 'companies');
  }

  private get usersCollection() {
    return collection(db, 'users');
  }
  
  async isRucUnique(ruc: string, excludeId?: string): Promise<boolean> {
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

  async createCompanyWithAdminUser(
    companyData: Partial<Omit<Company, 'id'>>,
    adminUserData: Partial<Omit<User, 'id'>>,
    isSuperAdminFlow: boolean = false
  ): Promise<{ companyId: string | null; userId: string }> {
      return runTransaction(db, async (transaction) => {
        const userId = adminUserData.uid!;
        let companyId: string | null = null;
        
        // 1. Validar RUC dentro de la transacción
        if (!isSuperAdminFlow && companyData.ruc) {
            const companiesRef = this.companiesCollection;
            const rucQuery = query(companiesRef, where('ruc', '==', companyData.ruc));
            const rucSnapshot = await transaction.get(rucQuery);
            if (!rucSnapshot.empty) {
                throw new Error(`El RUC "${companyData.ruc}" ya está registrado.`);
            }
        }

        // 2. Crear documento de compañía (si no es superadmin)
        if (!isSuperAdminFlow) {
            const companyDocRef = doc(this.companiesCollection);
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

        // 3. Crear documento de usuario
        const userDocRef = doc(this.usersCollection, userId);
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
            avatarUrl: `https://placehold.co/100x100.png?text=${adminUserData.firstName!.charAt(0)}`,
            username: adminUserData.email!.split('@')[0],
        };
        transaction.set(userDocRef, newUserDoc);

        return { companyId, userId };
    }).catch(error => {
        console.error("Error en la transacción de creación de compañía y usuario:", error);
        throw error; // Relanzar para que el llamador pueda manejarlo
    });
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
    await this.updateCompany(companyId, { status: 'inactive' }, user);
  }
}

export const companyService = new CompanyService();
