
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

// Función robusta para convertir cualquier formato de fecha a ISO string
const serializeDate = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return new Date(date).toISOString();
  if (typeof date === 'object' && date.seconds) return new Date(date.seconds * 1000).toISOString();
  return new Date().toISOString();
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

    const reservationDoc = {
      ...data,
      restaurantId: restaurantId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
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
      
      const q = query(
        coll,
        where('restaurantId', '==', companyId),
        orderBy('dateTime', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      console.log(`[ReservationService] Se encontraron ${querySnapshot.size} documentos para la compañía ${companyId}.`);
      
      const reservations: Reservation[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Usamos la nueva función segura para serializar las fechas
          return {
              ...data,
              id: doc.id,
              createdAt: serializeDate(data.createdAt),
              updatedAt: serializeDate(data.updatedAt),
              dateTime: serializeDate(data.dateTime),
          } as Reservation;
      });

      console.log(`[ReservationService] Se procesaron y ordenaron ${reservations.length} reservas.`);
      return reservations;

    } catch (error: any) {
      console.error(`[ReservationService] Error al obtener las reservas para ${companyId}:`, error);
      if (error.code === 'failed-precondition') {
          console.error("Firestore requiere un índice para esta consulta. Por favor, crea uno desde el enlace en el mensaje de error de la consola.");
          throw new Error("Firestore requiere un índice para esta consulta.");
      }
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
