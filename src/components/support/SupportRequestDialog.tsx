
"use client";

import React, { useState, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, UploadCloud, XCircle } from 'lucide-react';
import { supportService, CreateSupportTicket } from '@/services/support-service';
import { useSession } from '@/contexts/session-context';
import { storageService } from '@/services/storage-service';
import Image from 'next/image';

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
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Límite de 5MB
        toast({ title: "Archivo demasiado grande", description: "Por favor, elige un archivo de menos de 5MB.", variant: "destructive" });
        return;
      }
      setAttachment(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setPreview(null);
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const resetForm = () => {
      setSubject('');
      setMessage('');
      setPriority('medium');
      clearAttachment();
  };

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
      let attachmentUrl: string | undefined = undefined;
      
      if (attachment) {
        toast({ title: "Subiendo adjunto...", description: "Por favor, espera un momento."});
        attachmentUrl = await storageService.compressAndUploadFile(attachment, `support-attachments/${companyId}/`);
      }

      const ticketData: CreateSupportTicket = {
        companyId,
        companyName,
        planName,
        userId: currentUser.id,
        userEmail: currentUser.email,
        subject,
        message,
        priority,
        attachmentUrl,
      };

      await supportService.createTicket(ticketData);

      toast({
        title: "¡Solicitud Enviada!",
        description: "Tu mensaje ha sido enviado a nuestro equipo de soporte. Te contactaremos pronto.",
      });
      
      resetForm();
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
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetForm(); onClose(); }}>
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
              disabled={isSending}
            />
          </div>
          <div>
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')} disabled={isSending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe tu problema o consulta en detalle aquí..."
              rows={6}
              disabled={isSending}
            />
          </div>
          <div>
            <Label htmlFor="attachment">Adjuntar Imagen (Opcional)</Label>
            <div className="mt-2 flex items-center gap-4">
               <Button asChild variant="outline" disabled={isSending}>
                <label htmlFor="attachment" className="cursor-pointer">
                    <UploadCloud className="mr-2 h-4 w-4"/>
                    Seleccionar Archivo
                </label>
               </Button>
               <Input id="attachment" type="file" className="hidden" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} />
               {preview && (
                 <div className="relative">
                    <Image src={preview} alt="Vista previa" width={48} height={48} className="h-12 w-12 rounded-md object-cover border"/>
                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={clearAttachment}>
                        <XCircle className="h-4 w-4"/>
                    </Button>
                 </div>
               )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Puedes adjuntar una captura de pantalla (JPG, PNG, GIF, máx. 5MB).</p>
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
