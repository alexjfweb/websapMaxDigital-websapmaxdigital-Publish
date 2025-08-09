
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { supportService, CreateSupportTicket } from '@/services/support-service';
import { useSession } from '@/contexts/session-context';

interface SupportRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  planName: string;
}

export default function SupportRequestDialog({ isOpen, onClose, companyId, companyName, planName }: SupportRequestDialogProps) {
  const { currentUser } = useSession();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa el asunto y el mensaje.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const ticketData: CreateSupportTicket = {
        companyId,
        companyName,
        planName,
        userId: currentUser.id,
        userEmail: currentUser.email,
        subject,
        message,
      };

      await supportService.createTicket(ticketData);

      toast({
        title: "¡Solicitud Enviada!",
        description: "Tu mensaje ha sido enviado a nuestro equipo de soporte. Te contactaremos pronto.",
      });
      
      setSubject('');
      setMessage('');
      onClose();

    } catch (error) {
      console.error("Error sending support ticket:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar tu solicitud. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Contactar a Soporte</DialogTitle>
          <DialogDescription>
            Envíanos tu consulta y nuestro equipo se pondrá en contacto contigo a la brevedad.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Problema con la facturación"
            />
          </div>
          <div>
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe tu problema o consulta en detalle aquí..."
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSending}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isSending ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
