
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
import { serializeDate } from '@/lib/utils';

type CreateReservationInput = Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'status'>;


class ReservationService {

  // Este método sigue siendo necesario para el formulario público de reservas.
  async createReservation(data: CreateReservationInput): Promise<string> {
    if (!data.restaurantId) {
      throw new Error("El ID del restaurante es obligatorio.");
    }
    // Llamada a la API de backend para crear la reserva
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create reservation');
    }
    const result = await response.json();
    return result.id;
  }
  
  async getReservationsByCompany(companyId: string): Promise<Reservation[]> {
    if (!companyId) return [];
    
    // CORRECCIÓN: Se consulta directamente a Firestore en lugar de llamar a una API
    const reservationsCollection = collection(db, 'reservations');
    const q = query(
        reservationsCollection,
        where('restaurantId', '==', companyId),
        orderBy('dateTime', 'desc') // Ordenar por fecha de la reserva
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            dateTime: serializeDate(data.dateTime)!,
            createdAt: serializeDate(data.createdAt)!,
            updatedAt: serializeDate(data.updatedAt)!,
        } as Reservation;
    });
  }
  
  async updateReservationStatus(reservationId: string, status: Reservation['status']): Promise<void> {
    // Llamada a la API de backend para actualizar el estado
    const response = await fetch(`/api/reservations?id=${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update reservation status');
    }
  }
}

export const reservationService = new ReservationService();
