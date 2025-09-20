
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Filter, Eye, LifeBuoy, Inbox, Clock, Check, RefreshCw } from "lucide-react";
import { supportService } from "@/services/support-service";
import type { SupportTicket } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import useSWR from 'swr';

const fetcher = () => supportService.getTickets();

export default function SuperAdminSupportPage() {
  const { data: tickets, error, isLoading, mutate } = useSWR('support-tickets', fetcher, { revalidateOnFocus: false });
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    status: 'all',
    searchTerm: '',
  });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
    try {
      await supportService.updateTicketStatus(ticketId, newStatus);
      mutate(); // Revalida los datos
      toast({ title: "Estado actualizado", description: "El estado del ticket ha sido cambiado." });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo actualizar el estado del ticket.", variant: "destructive" });
    }
  };
  
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter(ticket => {
      const searchTerm = filters.searchTerm.toLowerCase();
      const statusMatch = filters.status === 'all' || ticket.status === filters.status;
      const searchMatch = !searchTerm ||
        ticket.companyName.toLowerCase().includes(searchTerm) ||
        ticket.subject.toLowerCase().includes(searchTerm) ||
        ticket.userEmail.toLowerCase().includes(searchTerm);
      return statusMatch && searchMatch;
    });
  }, [tickets, filters]);

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case "open": return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Abierto</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">En Progreso</Badge>;
      case "closed": return <Badge variant="secondary">Cerrado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
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
          Mensajes de Contacto
        </h1>
        <p className="text-lg text-muted-foreground">Administra y responde a las solicitudes de los clientes.</p>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abiertos</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets?.filter(t => t.status === 'open').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets?.filter(t => t.status === 'in_progress').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets?.filter(t => t.status === 'closed').length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bandeja de Entrada</CardTitle>
          <CardDescription>Aquí puedes ver todas las solicitudes de soporte.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
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
            <Button variant="outline" onClick={() => mutate()} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa / Plan</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Fecha</TableHead>
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
                    <TableCell>{ticket.userEmail}</TableCell>
                    <TableCell>{format(ticket.createdAt.toDate(), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
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
        </CardContent>
      </Card>
      
      {/* Modal de Detalles */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              Ticket de: {selectedTicket?.companyName} ({selectedTicket?.userEmail})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="p-4 bg-muted rounded-md border">
              <p className="whitespace-pre-wrap">{selectedTicket?.message}</p>
            </div>
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
