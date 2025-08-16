
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { SupportTicket, CreateSupportTicket } from '@/types';

class SupportService {
  private get ticketsCollection() {
    return collection(db, 'supportTickets');
  }

  /**
   * Crea un nuevo ticket de soporte.
   * @param ticketData - Datos del nuevo ticket.
   * @returns El ID del ticket creado.
   */
  async createTicket(ticketData: CreateSupportTicket): Promise<string> {
    const ticketDoc = {
      ...ticketData,
      status: 'open' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Asegurarse de que el campo attachmentUrl esté presente si existe, si no, no se añade.
      ...(ticketData.attachmentUrl && { attachmentUrl: ticketData.attachmentUrl }),
    };

    const docRef = await addDoc(this.ticketsCollection, ticketDoc);
    return docRef.id;
  }

  /**
   * Obtiene todos los tickets de soporte, ordenados por fecha de creación.
   * @returns Un array de objetos SupportTicket.
   */
  async getTickets(): Promise<SupportTicket[]> {
    const q = query(this.ticketsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const tickets: SupportTicket[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      tickets.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt, // Mantener como Timestamp de Firestore
        updatedAt: data.updatedAt,
      } as SupportTicket);
    });

    return tickets;
  }

  /**
   * Actualiza el estado de un ticket de soporte.
   * @param ticketId - El ID del ticket a actualizar.
   * @param status - El nuevo estado del ticket.
   */
  async updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
    const ticketRef = doc(this.ticketsCollection, ticketId);
    await updateDoc(ticketRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Añade una respuesta a un ticket de soporte.
   * @param ticketId - El ID del ticket.
   * @param reply - El objeto de respuesta.
   */
  async addReply(ticketId: string, reply: { userId: string; message: string; createdAt: any }): Promise<void> {
    // Esta es una implementación simplificada. En una app real, las respuestas serían una subcolección.
    // Aquí simplemente actualizaremos un array en el documento principal para mantenerlo simple.
    console.log("Añadiendo respuesta (placeholder):", ticketId, reply);
  }
}

export const supportService = new SupportService();
