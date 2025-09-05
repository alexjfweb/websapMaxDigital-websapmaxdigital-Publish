
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

  // Este método es para el cliente (frontend) y llama a la API.
  async createReservation(data: CreateReservationInput): Promise<string> {
    if (!data.restaurantId) {
      throw new Error("El ID del restaurante es obligatorio.");
    }

    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        const result = await response.json().catch(() => ({ error: 'Error desconocido al crear la reserva.' }));
        throw new Error(result.error || 'Failed to create reservation');
    }
    const result = await response.json();
    return result.id;
  }

  // Este método es para el servidor (backend) y escribe en Firestore.
  async createReservationInDB(data: CreateReservationInput): Promise<string> {
    const newReservationData = {
      ...data,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const reservationsCollection = collection(db, 'reservations');
    const docRef = await addDoc(reservationsCollection, newReservationData);
    return docRef.id;
  }
  
  async getReservationsByCompany(companyId: string): Promise<Reservation[]> {
    if (!companyId) return [];
    
    const reservationsCollection = collection(db, 'reservations');
    const q = query(
        reservationsCollection,
        where('restaurantId', '==', companyId),
        orderBy('dateTime', 'desc')
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
    const reservationsCollection = collection(db, 'reservations');
    const reservationRef = doc(reservationsCollection, reservationId);
    await updateDoc(reservationRef, { status, updatedAt: serverTimestamp() });
  }
}

export const reservationService = new ReservationService();
