"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye, Search, Filter, CalendarDays, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import ReservationForm from '@/components/forms/reservation-form';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

// Mock Data for Reservations (can be same as admin or filtered for employee view)
const mockReservations = [
  { id: "res-e1", customerName: "Alice Wonderland", date: "2024-08-15T19:00:00Z", guests: 4, phone: "555-0101", status: "confirmed", notes: "Window seat preferred" },
  { id: "res-e2", customerName: "Bob The Builder", date: "2024-08-16T20:30:00Z", guests: 2, phone: "555-0102", status: "pending", notes: "Birthday celebration" },
  { id: "res-e3", customerName: "Charlie Brown", date: "2024-08-15T18:00:00Z", guests: 6, phone: "555-0103", status: "cancelled", notes: "" },
];

export default function EmployeeReservationsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const reservations = mockReservations;
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-green-500 text-white hover:bg-green-600">Confirmada</Badge>;
      case "pending": return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pendiente</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenDetail = (reservation: any) => { setSelectedReservation(reservation); setOpenDetail(true); };
  const handleOpenConfirm = (reservation: any) => { setSelectedReservation(reservation); setOpenConfirm(true); };
  const handleOpenCancel = (reservation: any) => { setSelectedReservation(reservation); setOpenCancel(true); };
  const handleCloseModals = () => { setOpenDetail(false); setOpenConfirm(false); setOpenCancel(false); setSelectedReservation(null); };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

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
          <CardTitle>Reservas del empleado</CardTitle>
          <CardDescription>Resumen de tus reservas</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o teléfono" className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filtrar por estado
            </Button>
             <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" /> Ver calendario
            </Button>
          </div>
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
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.customerName}</TableCell>
                  <TableCell>{format(new Date(reservation.date), "MMM d, yyyy 'at' h:mm a")}</TableCell>
                  <TableCell className="text-center">{reservation.guests}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground truncate max-w-xs">
                    {reservation.notes || 'Sin notas'}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(reservation.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:text-primary" title="Acciones">
                            <span className="sr-only">Acciones</span>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleOpenDetail(reservation)}>
                            Ver detalles
                          </DropdownMenuItem>
                          {reservation.status === 'pending' && (
                            <DropdownMenuItem onSelect={() => handleOpenConfirm(reservation)}>
                              Confirmar
                            </DropdownMenuItem>
                          )}
                          {reservation.status === 'pending' && (
                            <DropdownMenuItem onSelect={() => handleOpenCancel(reservation)}>
                              Cancelar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
               {reservations.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay reservas disponibles
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {/* Modales de acciones */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ver detalles</DialogTitle>
            <DialogDescription>Resumen de la reserva</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-2 text-base">
              <div><b>Nombre del cliente:</b> {selectedReservation.customerName}</div>
              <div><b>Fecha y hora:</b> {format(new Date(selectedReservation.date), 'PPPp')}</div>
              <div><b>Invitados:</b> {selectedReservation.guests}</div>
              <div><b>Notas:</b> {selectedReservation.notes || 'Sin notas'}</div>
              <div className="flex items-center gap-2"><b>Estado:</b> {getStatusBadge(selectedReservation.status)}</div>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button onClick={handleCloseModals}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar reserva</DialogTitle>
            <DialogDescription>Resumen de la reserva</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <span className="text-lg font-semibold">Nombre del cliente: {selectedReservation?.customerName}</span>
            <div className="mt-2 text-muted-foreground">¿Estás seguro de confirmar esta reserva?</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleCloseModals}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openCancel} onOpenChange={setOpenCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar reserva</DialogTitle>
            <DialogDescription>Resumen de la reserva</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <span className="text-lg font-semibold">Nombre del cliente: {selectedReservation?.customerName}</span>
            <div className="mt-2 text-muted-foreground">¿Estás seguro de cancelar esta reserva?</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleCloseModals}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
