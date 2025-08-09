
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

export type CreateCompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;

class CompanyService {
  private get companiesCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'companies'.");
      throw new Error("La base de datos no está disponible.");
    }
    return collection(db, 'companies');
  }

  private parseTimestamp(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (timestamp instanceof Timestamp) return timestamp.toDate().toISOString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toISOString();
    return new Date(timestamp).toISOString();
  }

  /**
   * Obtiene todas las empresas activas de Firestore.
   */
  async getCompanies(): Promise<Company[]> {
    const coll = this.companiesCollection;
    if (!coll) return [];

    try {
      const q = query(coll, where("status", "in", ["active", "pending", "inactive"]));
      const querySnapshot = await getDocs(q);
      const companies: Company[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.name) {
          console.warn(`[WARN] Documento de empresa ${doc.id} omitido por falta de nombre.`);
          return;
        }

        companies.push({
          id: doc.id,
          ...data,
          createdAt: this.parseTimestamp(data.createdAt),
          updatedAt: this.parseTimestamp(data.updatedAt),
          registrationDate: this.parseTimestamp(data.registrationDate),
        } as Company);
      });
      
      console.log(`✅ Se obtuvieron ${companies.length} empresas de Firestore.`);
      return companies;
    } catch (error) {
      console.error('❌ Error al obtener las empresas de Firestore:', error);
      throw new Error('No se pudieron obtener las empresas.');
    }
  }

  /**
   * Obtiene una empresa por su ID.
   */
  async getCompanyById(id: string): Promise<Company | null> {
    const coll = this.companiesCollection;
    if (!coll) return null;
    
    const docRef = doc(coll, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    const data = docSnap.data();
    return { 
        id: docSnap.id, 
        ...data,
        createdAt: this.parseTimestamp(data.createdAt),
        updatedAt: this.parseTimestamp(data.updatedAt),
        registrationDate: this.parseTimestamp(data.registrationDate),
    } as Company;
  }
  
  /**
   * Crea una nueva empresa en Firestore.
   * @param companyData - Datos de la nueva empresa.
   * @param user - Información del usuario que realiza la acción.
   * @returns La empresa recién creada con su ID.
   */
  async createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>, user: { uid: string; email: string }): Promise<Company> {
    const coll = this.companiesCollection;
    if (!coll) throw new Error("La base de datos no está disponible.");

    if (!companyData.name || !companyData.ruc) {
      throw new Error("El nombre de la empresa y el RUC son obligatorios.");
    }
    
    const docRef = await addDoc(coll, {
      ...companyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    const newCompanyData: Company = {
      id: docRef.id,
      ...companyData,
      createdAt: new Date().toISOString(), // Use ISO string for consistency
      updatedAt: new Date().toISOString(),
    };
    
    await auditService.log({
      entity: 'companies',
      entityId: docRef.id,
      action: 'created',
      performedBy: user,
      newData: newCompanyData,
    });
    
    return newCompanyData;
  }


  /**
   * Actualiza una empresa existente en Firestore.
   */
  async updateCompany(companyId: string, companyData: Partial<Company>, user: { uid: string; email: string }): Promise<Company> {
    const coll = this.companiesCollection;
    if (!coll) throw new Error("La base de datos no está disponible.");

    const docRef = doc(coll, companyId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("La empresa no existe.");
    }
    
    const previousData = { id: docSnap.id, ...docSnap.data() } as Company;
    
    const updatePayload = {
      ...companyData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, updatePayload);
    const updatedDoc = await getDoc(docRef);

    const newData = { id: updatedDoc.id, ...updatedDoc.data() } as Company;

    await auditService.log({
      entity: 'companies',
      entityId: companyId,
      action: 'updated',
      performedBy: user,
      previousData,
      newData,
    });

    console.log(`✅ Empresa actualizada con éxito en Firestore. ID: ${companyId}`);
    return newData;
  }
}

export const companyService = new CompanyService();
