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
      restaurantId: restaurantId, // Aseguramos que el campo se llame 'restaurantId'
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(coll, reservationDoc);
    console.log(`✅ Reserva creada con restaurantId: ${reservationDoc.restaurantId}`);
    return docRef.id;
  }
  
  // Obtiene todas las reservas para una compañía específica, ordenadas por fecha.
  async getReservationsByCompany(companyId: string): Promise<Reservation[]> {
    const coll = this.reservationsCollection;

    if (!companyId) {
      console.log("[ReservationService] ID de compañía no proporcionado. Devolviendo array vacío.");
      return [];
    }

    try {
      console.log(`[ReservationService] Consultando reservas con restaurantId: ${companyId}`);
      
      // Corrección: Se elimina el filtro `where('isActive', '==', true)` que era incorrecto.
      // Se añade `orderBy` para mostrar las más recientes primero.
      const q = query(
        coll,
        where('restaurantId', '==', companyId),
        orderBy('dateTime', 'desc')
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

      console.log(`[ReservationService] Se procesaron ${reservations.length} reservas.`);
      return reservations;

    } catch (error: any) {
      console.error(`[ReservationService] Error al obtener las reservas para ${companyId}:`, error);
      // Si el error es por un índice faltante, Firestore lo indicará en la consola con un enlace para crearlo.
      throw new Error("No se pudieron obtener las reservas. Verifica la consola para posibles errores de índice en Firestore.");
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
