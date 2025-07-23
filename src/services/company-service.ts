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

// Define el tipo de entrada para la creación, omitiendo campos generados por el sistema
export type CreateCompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'registrationDate' | 'status'>;

class CompanyService {
  private companiesCollection = collection(db, 'companies');

  /**
   * Valida los datos de entrada de la empresa.
   * Lanza un error si la validación falla.
   * @param data - Datos de la empresa a validar.
   */
  private validateCompanyData(data: Partial<CreateCompanyInput>): void {
    if ('name' in data && (!data.name || data.name.trim() === '')) {
      throw new Error("El campo 'name' es obligatorio.");
    }
    if ('ruc' in data && (!data.ruc || data.ruc.trim() === '')) {
      throw new Error("El campo 'ruc' es obligatorio.");
    }
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      throw new Error("El formato del correo electrónico no es válido.");
    }
    // Aquí se pueden agregar más validaciones, como formato de RUC, etc.
  }

  /**
   * Crea una nueva empresa en Firestore.
   * @param companyData - Datos de la nueva empresa.
   * @returns El ID de la empresa recién creada.
   */
  async createCompany(companyData: CreateCompanyInput): Promise<string> {
    // 1. Validar los datos antes de la escritura
    this.validateCompanyData(companyData);
    console.log('✅ Validación de datos de la empresa superada.');

    try {
      // 2. Preparar el documento con timestamps del servidor
      const newCompanyDoc = {
        ...companyData,
        status: 'active', // Estado por defecto al crear
        registrationDate: new Date().toISOString(), // Fecha de registro actual
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 3. Agregar el documento a Firestore
      const docRef = await addDoc(this.companiesCollection, newCompanyDoc);
      console.log(`✅ Empresa creada con éxito en Firestore. ID: ${docRef.id}`);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error al crear la empresa en Firestore:', error);
      // Lanza el error para que sea manejado por la capa de la API
      throw new Error('No se pudo crear la empresa en la base de datos.');
    }
  }

  /**
   * Obtiene todas las empresas activas de Firestore.
   * @returns Un array de objetos Company.
   */
  async getCompanies(): Promise<Company[]> {
    try {
      const q = query(this.companiesCollection, where("status", "in", ["active", "pending", "inactive"]));
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
          createdAt: createdAt,
          updatedAt: updatedAt,
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
    const docRef = doc(db, 'companies', id);
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
  async updateCompany(companyId: string, companyData: Partial<Company>): Promise<Company> {
    const docRef = doc(db, 'companies', companyId);

    // Opcional: validar que la empresa exista antes de actualizar
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("La empresa no existe.");
    }
    
    // Validar los datos que se van a actualizar
    this.validateCompanyData(companyData);

    try {
      const updatePayload = {
        ...companyData,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, updatePayload);
      const updatedDoc = await getDoc(docRef);
      console.log(`✅ Empresa actualizada con éxito en Firestore. ID: ${companyId}`);
      return { id: updatedDoc.id, ...updatedDoc.data() } as Company;
    } catch (error) {
      console.error(`❌ Error al actualizar la empresa ${companyId} en Firestore:`, error);
      throw new Error('No se pudo actualizar la empresa en la base de datos.');
    }
  }
}

export const companyService = new CompanyService();
