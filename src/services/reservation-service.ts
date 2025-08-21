
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

type CreateReservationInput = Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'status'>;


class ReservationService {

  // Este método sigue siendo necesario para el formulario público de reservas.
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
        const result = await response.json();
        throw new Error(result.error || 'Failed to create reservation');
    }
    const result = await response.json();
    return result.id;
  }
  
  async getReservationsByCompany(companyId: string): Promise<Reservation[]> {
    if (!companyId) return [];
     const response = await fetch(`/api/companies/${companyId}/reservations`);
     if (!response.ok) {
        throw new Error('Failed to fetch reservations');
     }
     return response.json();
  }
  
  async updateReservationStatus(reservationId: string, status: Reservation['status']): Promise<void> {
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
