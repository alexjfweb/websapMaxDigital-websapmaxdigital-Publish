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
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Reservation } from '@/types';

class ReservationService {
  private get reservationsCollection() {
    if (!db) {
      throw new Error("Firebase no está inicializado. Revisa tu configuración en .env.local");
    }
    return collection(db, 'reservations');
  }

  private validateReservationData(data: Partial<Omit<Reservation, 'id'>>): void {
    if (!data.companyId) throw new Error("companyId es obligatorio.");
    if (!data.customerName) throw new Error("El nombre del cliente es obligatorio.");
    if (!data.customerPhone) throw new Error("El teléfono del cliente es obligatorio.");
    if (!data.dateTime) throw new Error("La fecha y hora son obligatorias.");
    if (!data.numberOfGuests || data.numberOfGuests <= 0) throw new Error("El número de invitados debe ser mayor a 0.");
    if (!data.status) throw new Error("El estado es obligatorio.");
  }

  async createReservation(data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    this.validateReservationData(data);

    try {
      const reservationDoc = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(this.reservationsCollection, reservationDoc);
      return docRef.id;
    } catch (error) {
      console.error("Error al crear la reserva en Firestore:", error);
      throw new Error("No se pudo crear la reserva.");
    }
  }
  
  async getReservationsByCompany(companyId: string): Promise<Reservation[]> {
    if (!companyId) {
      throw new Error("companyId es requerido.");
    }

    try {
      const q = query(
        this.reservationsCollection,
        where('companyId', '==', companyId),
        orderBy('dateTime', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reservations: Reservation[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        // Validación de datos en el servidor
        if (!data.customerName || !data.dateTime || !data.status) {
            console.warn(`[WARN] Reserva ${doc.id} omitida por datos incompletos.`);
            return;
        }
        
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString();
        const dateTime = data.dateTime instanceof Timestamp ? data.dateTime.toDate().toISOString() : data.dateTime;

        reservations.push({
          id: doc.id,
          companyId: data.companyId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          dateTime,
          numberOfGuests: data.numberOfGuests,
          status: data.status,
          notes: data.notes,
          createdAt,
          updatedAt,
        });
      });
      return reservations;
    } catch (error) {
      console.error("Error al obtener las reservas:", error);
      throw new Error("No se pudieron obtener las reservas.");
    }
  }
  
  async updateReservationStatus(reservationId: string, status: Reservation['status']): Promise<void> {
    if (!reservationId || !status) {
      throw new Error("ID de reserva y nuevo estado son requeridos.");
    }
    
    try {
      const reservationRef = doc(this.reservationsCollection, reservationId);
      await updateDoc(reservationRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error al actualizar estado de la reserva ${reservationId}:`, error);
      throw new Error("No se pudo actualizar la reserva.");
    }
  }
}

export const reservationService = new ReservationService();
