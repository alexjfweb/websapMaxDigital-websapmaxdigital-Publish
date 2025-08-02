
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Reservation } from '@/types';

type CreateReservationInput = Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
    restaurantId: string;
};

class ReservationService {
  private get reservationsCollection() {
    if (!db) {
      console.error("Firebase no está inicializado. No se puede acceder a la colección 'reservations'.");
      throw new Error("La base de datos no está disponible.");
    }
    return collection(db, 'reservations');
  }

  // Crea una nueva reserva en Firestore.
  async createReservation(data: CreateReservationInput): Promise<string> {
    const coll = this.reservationsCollection;
    
    const restaurantId = data.restaurantId;

    if (!restaurantId) {
        throw new Error("El ID del restaurante es obligatorio para crear una reserva.");
    }

    // Estandarización: Siempre guardar con el campo 'restaurantId'.
    const reservationDoc = {
      ...data,
      restaurantId: restaurantId, // Asegura que el campo siempre se llame así
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Eliminamos cualquier posible campo 'companyId' para evitar duplicados
    delete (reservationDoc as any).companyId;

    const docRef = await addDoc(coll, reservationDoc);
    console.log(`✅ Reserva creada con restaurantId: ${reservationDoc.restaurantId}`);
    return docRef.id;
  }
  
  // Obtiene todas las reservas para una compañía específica.
  async getReservationsByCompany(companyId: string): Promise<Reservation[]> {
    const coll = this.reservationsCollection;

    if (!companyId) {
      console.log("[ReservationService] ID de compañía no proporcionado. Devolviendo array vacío.");
      return [];
    }

    try {
      console.log(`[ReservationService] Consultando reservas con restaurantId: ${companyId}`);
      
      // Se elimina el orderBy para evitar el error de índice. La ordenación se hará en el cliente.
      const q = query(
        coll,
        where('restaurantId', '==', companyId)
      );

      const querySnapshot = await getDocs(q);
      
      console.log(`[ReservationService] Se encontraron ${querySnapshot.size} documentos para la compañía ${companyId}.`);
      
      const reservations: Reservation[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
          const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString();
          const dateTime = data.dateTime instanceof Timestamp ? data.dateTime.toDate().toISOString() : data.dateTime;
          
          return {
              id: doc.id,
              ...data,
              createdAt,
              updatedAt,
              dateTime,
          } as Reservation;
      });

      // Ordenar los resultados en el lado del cliente
      reservations.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

      console.log(`[ReservationService] Se procesaron y ordenaron ${reservations.length} reservas.`);
      return reservations;

    } catch (error: any) {
      console.error(`[ReservationService] Error al obtener las reservas para ${companyId}:`, error);
      // Devuelve un error claro si es un problema de índice
      if (error.code === 'failed-precondition') {
          console.error("Firestore requiere un índice para esta consulta. Por favor, crea uno desde el enlace en el mensaje de error de la consola.");
          throw new Error("Se requiere un índice de Firestore para esta consulta. Revisa la consola del navegador para ver el enlace para crearlo.");
      }
      throw new Error("No se pudieron obtener las reservas. Verifica la consola para más detalles.");
    }
  }
  
  // Actualiza el estado de una reserva existente.
  async updateReservationStatus(reservationId: string, status: Reservation['status']): Promise<void> {
    const coll = this.reservationsCollection;

    if (!reservationId || !status) {
      throw new Error("ID de reserva y nuevo estado son requeridos.");
    }
    
    const reservationRef = doc(coll, reservationId);
    await updateDoc(reservationRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }
}

export const reservationService = new ReservationService();
