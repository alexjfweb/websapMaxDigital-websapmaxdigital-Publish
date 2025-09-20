
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Send, Eye, MessageSquare, PlusCircle, Loader2 } from 'lucide-react';
import SupportRequestDialog from '@/components/support/SupportRequestDialog';
import { useSubscription } from '@/hooks/use-subscription';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/contexts/session-context';
import type { SupportTicket } from '@/types';
import { supportService } from '@/services/support-service';
import useSWR from 'swr';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';


const fetchTicketsByCompany = async (companyId: string | undefined): Promise<SupportTicket[]> => {
    if (!companyId) return [];
    const allTickets = await supportService.getTickets();
    return allTickets.filter(ticket => ticket.companyId === companyId);
};

export default function AdminSupportPage() {
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();

  const { currentUser, isLoading: isSessionLoading } = useSession();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();

  const companyId = currentUser?.companyId;

  const { data: tickets, error, isLoading: isTicketsLoading, mutate } = useSWR(
    companyId ? `support-tickets/${companyId}` : null,
    () => fetchTicketsByCompany(companyId),
    { revalidateOnFocus: false }
  );

  const isLoading = isSessionLoading || isSubscriptionLoading || isTicketsLoading;
  const { company, plan } = subscription || {};

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim() || !currentUser) {
      toast({ title: "Mensaje vacío", description: "La respuesta no puede estar vacía.", variant: "destructive" });
      return;
    }
    setIsReplying(true);
    try {
      await supportService.addReply(selectedTicket.id, {
        userId: currentUser.uid,
        userName: currentUser.firstName || currentUser.username || currentUser.email || 'Usuario',
        message: replyMessage,
      });
      setReplyMessage('');
      await mutate();
      toast({ title: "Respuesta Enviada", description: "Tu mensaje ha sido enviado al equipo de soporte." });
    } catch (e: any) {
      console.error("Error al enviar respuesta:", e);
      toast({ title: "Error al Responder", description: e.message || "Ocurrió un error inesperado.", variant: "destructive" });
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case "open": return <Badge className="bg-blue-500 text-white">Abierto</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500 text-white">En Progreso</Badge>;
      case "closed": return <Badge variant="secondary">Cerrado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-6 w-2/3" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {company && (
        <SupportRequestDialog
          isOpen={isSupportDialogOpen}
          onClose={() => setIsSupportDialogOpen(false)}
          companyId={company.id}
          companyName={company.name}
          planName={plan?.name || 'No Asignado'}
        />
      )}

      {selectedTicket && (
         <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedTicket.subject}</DialogTitle>
                    <DialogDescription>
                        Historial de la conversación.
                    </DialogDescription>
                </DialogHeader>
                 <div className="space-y-6 max-h-[50vh] overflow-y-auto p-4 border rounded-md my-4">
                    {/* Mensaje original */}
                     <div className="flex gap-3">
                        <Avatar>
                            <AvatarFallback>{selectedTicket.userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                        <div className="font-semibold text-sm">{selectedTicket.userEmail} (Tú)</div>
                        <div className="p-3 bg-muted rounded-lg border">
                            <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">{formatDate(selectedTicket.createdAt)}</div>
                        </div>
                    </div>

                    {/* Respuestas */}
                    {selectedTicket.replies?.map((reply, index) => (
                        <div key={index} className={cn("flex gap-3", reply.userId === currentUser?.uid ? "justify-end" : "justify-start")}>
                            {reply.userId !== currentUser?.uid && (
                                <Avatar>
                                    <AvatarFallback>{reply.userName ? reply.userName.charAt(0).toUpperCase() : 'S'}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("flex-1 space-y-2 max-w-[85%]", reply.userId === currentUser?.uid ? "text-right" : "")}>
                                <div className="font-semibold text-sm">{reply.userName}</div>
                                <div className={cn("p-3 rounded-lg border text-left", reply.userId !== currentUser?.uid ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                    <p className="whitespace-pre-wrap">{reply.message}</p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatDate(reply.createdAt)}
                                </div>
                            </div>
                             {reply.userId === currentUser?.uid && (
                                <Avatar>
                                    <AvatarFallback>{reply.userName ? reply.userName.charAt(0).toUpperCase() : 'Y'}</AvatarFallback>
                                </Avatar>
                             )}
                        </div>
                    ))}
                 </div>
                 {selectedTicket.status !== 'closed' && (
                  <div className="pt-4 border-t">
                    <Label htmlFor="replyMessage" className="font-semibold">Escribir una respuesta</Label>
                    <Textarea
                      id="replyMessage"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Escribe tu respuesta aquí..."
                      rows={3}
                      className="mt-2"
                      disabled={isReplying}
                    />
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleSendReply} disabled={isReplying || !replyMessage.trim()}>
                        {isReplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                        {isReplying ? 'Enviando...' : 'Enviar Respuesta'}
                      </Button>
                    </div>
                  </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                    <LifeBuoy className="h-8 w-8" />
                    Soporte Técnico
                </h1>
                <p className="text-lg text-muted-foreground">
                    Aquí puedes gestionar tus solicitudes de soporte y ver las respuestas de nuestro equipo.
                </p>
            </div>
            <Button size="lg" onClick={() => setIsSupportDialogOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Enviar Nueva Solicitud
            </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Mis Tickets de Soporte</CardTitle>
            <CardDescription>
              Historial de todas tus solicitudes enviadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Asunto</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets && tickets.length > 0 ? (
                        tickets.map(ticket => (
                            <TableRow key={ticket.id}>
                                <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                                <TableCell className="font-medium">{ticket.subject}</TableCell>
                                <TableCell>
                                    <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'secondary' : 'outline'}>
                                        {ticket.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedTicket(ticket); setIsDetailModalOpen(true); }}>
                                        <Eye className="mr-2 h-4 w-4"/>
                                        Ver
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No has enviado ninguna solicitud de soporte todavía.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
