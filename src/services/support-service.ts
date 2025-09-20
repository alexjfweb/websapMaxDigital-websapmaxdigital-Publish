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
import { serializeSupportDate } from '@/lib/utils'; // <- CAMBIO: Usar la nueva función

/**
 * Serializa un ticket completo convirtiendo todas las fechas a ISO strings
 * de forma segura. Específico para el módulo de soporte.
 */
function serializeTicket(data: any): SupportTicket {
  return {
    ...data,
    createdAt: serializeSupportDate(data.createdAt),
    updatedAt: serializeSupportDate(data.updatedAt),
    replies: (data.replies || []).map((reply: any) => ({
      ...reply,
      createdAt: serializeSupportDate(reply.createdAt),
    })),
  } as SupportTicket;
}

class SupportService {
  private get ticketsCollection() {
    const db = getDb();
    return collection(db, 'supportTickets');
  }

  async createTicket(ticketData: CreateSupportTicket): Promise<string> {
    const ticketDoc: any = {
      ...ticketData,
      status: 'open' as const,
      source: ticketData.companyId === 'public-contact' ? 'public' : 'internal',
      priority: ticketData.priority || 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      replies: [],
    };

    if (!ticketDoc.attachmentUrl) {
      delete ticketDoc.attachmentUrl;
    }
    
    const docRef = await addDoc(this.ticketsCollection, ticketDoc);
    return docRef.id;
  }

  async getTickets(): Promise<SupportTicket[]> {
    const q = query(this.ticketsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const tickets = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Usar la función de serialización segura aquí
      return serializeTicket({
        id: doc.id,
        ...data,
      });
    });

    return tickets;
  }

  async updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
    const ticketRef = doc(this.ticketsCollection, ticketId);
    await updateDoc(ticketRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }

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
