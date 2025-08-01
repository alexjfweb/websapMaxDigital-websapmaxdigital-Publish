
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type { Company } from '@/types';
import { auditService } from './audit-service';


// Define el tipo de entrada para la creación, omitiendo campos generados por el sistema
export type CreateCompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'registrationDate' | 'status' | 'phoneFixed' | 'addressStreet' | 'addressNeighborhood' | 'addressState' | 'addressPostalCode' | 'companyType'> & { status?: Company['status'] };

class CompanyService {
  private get companiesCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'companies'.");
      throw new Error("La base de datos no está disponible.");
    }
    return collection(db, 'companies');
  }

  /**
   * Crea una nueva empresa y devuelve su ID.
   * @param companyData - Los datos esenciales de la nueva empresa.
   * @param user - El usuario que realiza la creación.
   * @returns El ID de la nueva empresa.
   */
  async createCompany(companyData: CreateCompanyInput, user: { uid: string; email: string }): Promise<string> {
    const coll = this.companiesCollection;
    if (!coll) throw new Error("La base de datos no está disponible.");

    if (!companyData.name || !companyData.ruc) {
      console.error("❌ Validación fallida: El nombre y el RUC de la empresa son obligatorios.");
      throw new Error("El nombre y el RUC de la empresa son obligatorios.");
    }
    console.log("✅ Validación de datos de la empresa superada.");

    const newCompanyDoc = {
      ...companyData,
      status: companyData.status || 'pending',
      registrationDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(coll, newCompanyDoc);
      console.log(`✅ Empresa creada en Firestore con ID: ${docRef.id}`);

      // Log de auditoría
      await auditService.log({
        entity: 'companies',
        entityId: docRef.id,
        action: 'created',
        performedBy: user,
        newData: { id: docRef.id, ...newCompanyDoc },
      });

      return docRef.id;
    } catch (error) {
      console.error("❌ Error al crear la empresa en Firestore:", error);
      throw new Error("No se pudo registrar la nueva empresa.");
    }
  }


  /**
   * Obtiene todas las empresas activas de Firestore.
   * @returns Un array de objetos Company.
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
        // Validación en tiempo de lectura
        if (!data.name || !data.ruc) {
          console.warn(`[WARN] Documento de empresa ${doc.id} omitido por datos incompletos.`);
          return;
        }

        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date();

        companies.push({
          id: doc.id,
          name: data.name,
          ruc: data.ruc,
          location: data.location,
          addressStreet: data.addressStreet,
          addressNeighborhood: data.addressNeighborhood,
          addressState: data.addressState,
          addressPostalCode: data.addressPostalCode,
          companyType: data.companyType,
          status: data.status,
          registrationDate: data.registrationDate || new Date(0).toISOString(),
          phone: data.phone,
          phoneFixed: data.phoneFixed,
          email: data.email,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
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
   * @param companyId - El ID de la empresa a actualizar.
   * @param companyData - Los campos a actualizar.
   * @returns La empresa actualizada.
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

    