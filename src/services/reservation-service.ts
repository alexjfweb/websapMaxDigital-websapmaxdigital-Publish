
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

// Definición para la creación de una reserva, haciendo email opcional.
type CreateReservationInput = Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
  customerEmail?: string;
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
    
    if (!data.restaurantId) {
        throw new Error("El ID del restaurante es obligatorio para crear una reserva.");
    }

    // Asegura que los datos enviados a Firebase sean limpios.
    const reservationDoc = {
      restaurantId: data.restaurantId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || '', // Guardar un string vacío si es undefined
      dateTime: data.dateTime,
      numberOfGuests: data.numberOfGuests,
      notes: data.notes || '',
      status: 'pending', // Siempre se crean como pendientes.
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(coll, reservationDoc);
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
      console.log(`[ReservationService] Consultando reservas para la compañía: ${companyId}`);
      const q = query(
        coll,
        where('restaurantId', '==', companyId),
        orderBy('dateTime', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`[ReservationService] No se encontraron reservas para la compañía ${companyId}.`);
        return [];
      }
      
      const reservations: Reservation[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Aseguramos que los timestamps se conviertan a strings ISO
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

      console.log(`[ReservationService] Se encontraron y procesaron ${reservations.length} reservas.`);
      return reservations;

    } catch (error) {
      console.error(`[ReservationService] Error al obtener las reservas para ${companyId}:`, error);
      throw new Error("No se pudieron obtener las reservas.");
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
