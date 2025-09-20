
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Filter, Eye, LifeBuoy, Inbox, Clock, Check, RefreshCw, Send, Loader2 } from "lucide-react";
import { supportService } from "@/services/support-service";
import type { SupportTicket, User } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import useSWR from 'swr';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/contexts/session-context';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SuperAdminSupportPage() {
  const { currentUser } = useSession();
  const { toast } = useToast();

  // Estrategia de Fetching Corregida: fetcher definido dentro del componente con useCallback
  const fetcher = useCallback(async () => {
    return supportService.getTickets();
  }, []);

  const { data: tickets, error, isLoading, mutate } = useSWR('support-tickets', fetcher, { revalidateOnFocus: false });

  const [activeTab, setActiveTab] = useState('internal');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    searchTerm: '',
  });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
    try {
      await supportService.updateTicketStatus(ticketId, newStatus);
      mutate();
      toast({ title: "Estado actualizado", description: "El estado del ticket ha sido cambiado." });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo actualizar el estado del ticket.", variant: "destructive" });
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim() || !currentUser) {
      toast({ title: "Mensaje vacío", description: "La respuesta no puede estar vacía.", variant: "destructive" });
      return;
    }
    setIsReplying(true);
    try {
      await supportService.addReply(selectedTicket.id, {
        userId: currentUser.uid,
        userName: currentUser.firstName || currentUser.username,
        message: replyMessage,
      });
      setReplyMessage('');
      await mutate(); // Revalidar los datos para obtener la última versión
      toast({ title: "Respuesta enviada", description: "Tu respuesta ha sido añadida al ticket." });
      
      // Actualizar el ticket seleccionado en el estado local para reflejar la nueva respuesta inmediatamente
      setSelectedTicket(prevTicket => {
        if (!prevTicket) return null;
        const newReply = {
            userId: currentUser.uid,
            userName: currentUser.firstName || currentUser.username,
            message: replyMessage,
            createdAt: new Date() as any, // Simulamos la fecha para la UI inmediata
        };
        return {
            ...prevTicket,
            replies: [...(prevTicket.replies || []), newReply]
        };
      });

    } catch (e) {
      console.error("Error al enviar respuesta:", e);
      toast({ title: "Error al responder", variant: "destructive" });
    } finally {
      setIsReplying(false);
    }
  };
  
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    
    const sourceFiltered = tickets.filter(ticket => {
        if (activeTab === 'internal') return ticket.source === 'internal' || ticket.companyId !== 'public-contact';
        if (activeTab === 'public') return ticket.source === 'public' || ticket.companyId === 'public-contact';
        return false;
    });

    return sourceFiltered.filter(ticket => {
      const searchTerm = filters.searchTerm.toLowerCase();
      const statusMatch = filters.status === 'all' || ticket.status === filters.status;
      const priorityMatch = filters.priority === 'all' || ticket.priority === filters.priority;
      const searchMatch = !searchTerm ||
        ticket.companyName.toLowerCase().includes(searchTerm) ||
        ticket.subject.toLowerCase().includes(searchTerm) ||
        ticket.userEmail.toLowerCase().includes(searchTerm);
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [tickets, filters, activeTab]);

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case "open": return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Abierto</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">En Progreso</Badge>;
      case "closed": return <Badge variant="secondary">Cerrado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case "low": return <Badge variant="outline">Baja</Badge>;
      case "medium": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Media</Badge>;
      case "high": return <Badge variant="destructive">Alta</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const renderSkeleton = () => (
     <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <LifeBuoy className="h-8 w-8" />
          Soporte
        </h1>
        <p className="text-lg text-muted-foreground">Administra las solicitudes de los clientes y visitantes.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Bandeja de Entrada</CardTitle>
            <CardDescription>Visualiza y gestiona todos los tickets de soporte y mensajes de contacto.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="internal">Tickets de Soporte (Internos)</TabsTrigger>
                    <TabsTrigger value="public">Mensajes de Contacto (Públicos)</TabsTrigger>
                </TabsList>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
                <Input
                  placeholder="Buscar por empresa, asunto, email..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="md:col-span-2"
                />
                <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Estados</SelectItem>
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
                 <Select value={filters.priority} onValueChange={(val) => setFilters(prev => ({ ...prev, priority: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Prioridades</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            
            <div className="mt-4 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Remitente / Plan</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                {isLoading ? renderSkeleton() : (
                  <TableBody>
                    {filteredTickets.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div className="font-medium">{ticket.companyName}</div>
                          <div className="text-xs text-muted-foreground">{ticket.planName}</div>
                        </TableCell>
                        <TableCell>{ticket.subject}</TableCell>
                        <TableCell>{ticket.createdAt && ticket.createdAt.toDate && format(ticket.createdAt.toDate(), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedTicket(ticket); setIsDetailModalOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTickets.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No se encontraron tickets con los filtros actuales.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                )}
              </Table>
            </div>
        </CardContent>
      </Card>
      
      {/* Modal de Detalles y Respuestas */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              Ticket de: {selectedTicket?.companyName} ({selectedTicket?.userEmail})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <div className="space-y-4">
              {/* Mensaje Original */}
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>{selectedTicket?.userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="font-semibold text-sm">{selectedTicket?.userEmail}</div>
                  <div className="p-3 bg-muted rounded-lg border">
                    <p className="whitespace-pre-wrap">{selectedTicket?.message}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{selectedTicket && selectedTicket.createdAt && selectedTicket.createdAt.toDate ? format(selectedTicket.createdAt.toDate(), "PPPp", { locale: es }) : 'Fecha no disponible'}</div>
                </div>
              </div>
              
              {/* Respuestas */}
              {selectedTicket?.replies?.map((reply, index) => (
                <div key={index} className={cn("flex gap-3", reply.userId === currentUser?.uid ? "justify-end" : "justify-start")}>
                  {reply.userId !== currentUser?.uid && (
                    <Avatar>
                      <AvatarFallback>{reply.userName ? reply.userName.charAt(0).toUpperCase() : '?'}</AvatarFallback>
                    </Avatar>
                  )}
                   <div className={cn("flex-1 space-y-2", reply.userId === currentUser?.uid ? "text-right" : "")} style={{maxWidth: '85%'}}>
                     <div className="font-semibold text-sm">{reply.userName}</div>
                     <div className={cn("p-3 rounded-lg border", reply.userId === currentUser?.uid ? "bg-primary text-primary-foreground" : "bg-muted")}>
                       <p className="whitespace-pre-wrap">{reply.message}</p>
                     </div>
                     <div className="text-xs text-muted-foreground">
                      {reply.createdAt && reply.createdAt.toDate ? format(reply.createdAt.toDate(), "PPPp", { locale: es }) : 'Enviando...'}
                     </div>
                   </div>
                  {reply.userId === currentUser?.uid && (
                     <Avatar>
                      <AvatarFallback>{reply.userName ? reply.userName.charAt(0).toUpperCase() : 'SA'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <Label htmlFor="replyMessage" className="font-semibold">Escribir una respuesta</Label>
              <Textarea
                id="replyMessage"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                rows={4}
                className="mt-2"
                disabled={isReplying}
              />
              <div className="mt-4 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                  <Label>Cambiar estado:</Label>
                  <Select 
                    value={selectedTicket?.status} 
                    onValueChange={(value) => handleStatusChange(selectedTicket!.id, value as SupportTicket['status'])}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Abierto</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="closed">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSendReply} disabled={isReplying || !replyMessage.trim()}>
                  {isReplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                  {isReplying ? 'Enviando...' : 'Enviar Respuesta'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
