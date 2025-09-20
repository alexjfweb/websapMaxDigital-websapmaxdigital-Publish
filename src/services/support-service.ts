
import { getDb } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import type { SupportTicket, CreateSupportTicket } from '@/types';
import { serializeDate } from '@/lib/utils';

class SupportService {
  private get ticketsCollection() {
    const db = getDb();
    return collection(db, 'supportTickets');
  }

  /**
   * Crea un nuevo ticket de soporte.
   * @param ticketData - Datos del nuevo ticket.
   * @returns El ID del ticket creado.
   */
  async createTicket(ticketData: CreateSupportTicket): Promise<string> {
    const ticketDoc: any = {
      ...ticketData,
      status: 'open' as const,
      // Diferenciar el origen del ticket
      source: ticketData.companyId === 'public-contact' ? 'public' : 'internal',
      // Asignar prioridad por defecto si no viene
      priority: ticketData.priority || 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      replies: [], // Inicializar el array de respuestas
    };

    if (!ticketDoc.attachmentUrl) {
        delete ticketDoc.attachmentUrl;
    }
    
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
      const replies = (data.replies || []).map((reply: any) => ({
        ...reply,
        createdAt: serializeDate(reply.createdAt)
      }));

      tickets.push({
        id: doc.id,
        ...data,
        createdAt: serializeDate(data.createdAt),
        updatedAt: serializeDate(data.updatedAt),
        replies,
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
  async addReply(ticketId: string, reply: { userId: string; userName: string; message: string; }): Promise<void> {
    if (!reply.message.trim()) {
        throw new Error("El mensaje de respuesta no puede estar vacío.");
    }
    
    const ticketRef = doc(this.ticketsCollection, ticketId);
    
    const newReply = {
      ...reply,
      createdAt: serverTimestamp(),
    };
    
    await updateDoc(ticketRef, {
        replies: arrayUnion(newReply),
        updatedAt: serverTimestamp(),
    });
  }
}

export const supportService = new SupportService();
