
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Search, Filter, CalendarDays, PlusCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import ReservationForm from '@/components/forms/reservation-form';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useReservations } from "@/hooks/use-reservations";
import { reservationService } from "@/services/reservation-service";
import { useToast } from "@/hooks/use-toast";
import type { Reservation } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/session-context";

export default function EmployeeReservationsPage() {
  const { currentUser } = useSession();
  const companyId = currentUser?.companyId; 
  const { reservations, isLoading, error, refreshReservations } = useReservations(companyId);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<{ action: 'confirm' | 'cancel', reservation: Reservation } | null>(null);

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-green-500 text-white hover:bg-green-600">Confirmada</Badge>;
      case "pending": return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pendiente</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenDetail = (reservation: Reservation) => { setSelectedReservation(reservation); setOpenDetail(true); };
  
  const handleUpdateStatus = async (reservationId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await reservationService.updateReservationStatus(reservationId, status);
      toast({
        title: "Estado actualizado",
        description: `La reserva ha sido marcada como ${status === 'confirmed' ? 'confirmada' : 'cancelada'}.`,
      });
      await refreshReservations();
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado.",
        variant: "destructive",
      });
    }
    setActionToConfirm(null);
  };
  
  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ));
    }
    
    if (error) {
       return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-red-500 py-8">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8" />
              <span className="font-semibold">Error al cargar las reservas.</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }
    
    if (reservations.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
            No hay reservas disponibles.
          </TableCell>
        </TableRow>
      );
    }
    
    return reservations.map((reservation) => (
      <TableRow key={reservation.id}>
        <TableCell className="font-medium">{reservation.customerName}</TableCell>
        <TableCell>{format(new Date(reservation.dateTime), "MMM d, yyyy 'at' h:mm a")}</TableCell>
        <TableCell className="text-center">{reservation.numberOfGuests}</TableCell>
        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground truncate max-w-xs">
          {reservation.notes || 'Sin notas'}
        </TableCell>
        <TableCell className="text-center">{getStatusBadge(reservation.status)}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:text-primary" title="Acciones">
                <span className="sr-only">Acciones</span>
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => handleOpenDetail(reservation)}>Ver detalles</DropdownMenuItem>
              {reservation.status === 'pending' && <DropdownMenuItem onSelect={() => setActionToConfirm({ action: 'confirm', reservation })}>Confirmar</DropdownMenuItem>}
              {reservation.status === 'pending' && <DropdownMenuItem onSelect={() => setActionToConfirm({ action: 'cancel', reservation })}>Cancelar</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };


  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">Reservas del empleado</h1>
            <p className="text-lg text-muted-foreground">Gestiona y visualiza tus reservas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" /> Agregar nueva reserva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar nueva reserva</DialogTitle>
              <DialogDescription>Complete el formulario para agregar una nueva reserva</DialogDescription>
            </DialogHeader>
            <ReservationForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservas</CardTitle>
          <CardDescription>Resumen de tus reservas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del cliente</TableHead>
                <TableHead>Fecha y hora</TableHead>
                <TableHead className="text-center">Invitados</TableHead>
                <TableHead className="hidden sm:table-cell">Notas</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableBody()}</TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Ver detalles</DialogTitle></DialogHeader>
          {selectedReservation && (
            <div className="space-y-2 text-base">
              <div><b>Nombre del cliente:</b> {selectedReservation.customerName}</div>
              <div><b>Teléfono:</b> {selectedReservation.customerPhone}</div>
              <div><b>Fecha y hora:</b> {format(new Date(selectedReservation.dateTime), 'PPPp')}</div>
              <div><b>Invitados:</b> {selectedReservation.numberOfGuests}</div>
              <div><b>Notas:</b> {selectedReservation.notes || 'Sin notas'}</div>
              <div className="flex items-center gap-2"><b>Estado:</b> {getStatusBadge(selectedReservation.status)}</div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setOpenDetail(false)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!actionToConfirm} onOpenChange={() => setActionToConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Acción</DialogTitle>
            <DialogDescription>
              {actionToConfirm && `¿Estás seguro de que quieres ${actionToConfirm.action === 'confirm' ? 'confirmar' : 'cancelar'} la reserva para ${actionToConfirm.reservation.customerName}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionToConfirm(null)}>No, volver</Button>
            <Button
              className={actionToConfirm?.action === 'cancel' ? 'bg-destructive hover:bg-destructive/90' : ''}
              onClick={() => {
                if (actionToConfirm) {
                  handleUpdateStatus(actionToConfirm.reservation.id, actionToConfirm.action);
                }
              }}
            >
              Sí, proceder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
