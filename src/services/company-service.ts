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
import type { Company, CreateCompanyInput } from '@/types';
// import { auditService } from './audit-service'; // Descomentar cuando el servicio de auditoría sea estable

class CompanyService {
  private get companiesCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'companies'.");
      throw new Error("La base de datos no está disponible.");
    }
    return collection(db, 'companies');
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
          ...data
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
    return { id: docSnap.id, ...docSnap.data() } as Company;
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

    // Aquí se podría reactivar la auditoría si se desea
    // await auditService.log(...)

    console.log(`✅ Empresa actualizada con éxito en Firestore. ID: ${companyId}`);
    return newData;
  }
}

export const companyService = new CompanyService();
