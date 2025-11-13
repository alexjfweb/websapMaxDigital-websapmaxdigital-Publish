"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Search, Filter, CalendarDays, MoreVertical, AlertCircle, Phone, Printer, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState, useRef } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDays, isWithinInterval } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import type { Reservation } from "@/types";
import { useReservations } from "@/hooks/use-reservations";
import { reservationService } from "@/services/reservation-service";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/session-context";

export default function AdminReservationsPage() {
  const { currentUser } = useSession();
  const companyId = currentUser?.companyId;
  const { reservations, isLoading, error, refreshReservations } = useReservations(companyId);
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<{ action: 'confirm' | 'cancel' | 'complete', reservation: Reservation } | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-green-500 text-white hover:bg-green-600">Confirmada</Badge>;
      case "pending": return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pendiente</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelada</Badge>;
      case "completed": return <Badge variant="secondary">Completada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const statusMatch = statusFilter === 'all' || reservation.status === statusFilter;
    const dateMatch = !dateRange?.from || (dateRange.from && dateRange.to && isWithinInterval(new Date(reservation.dateTime), { start: dateRange.from, end: addDays(dateRange.to, 1) }));
    const searchMatch = !search || reservation.customerName.toLowerCase().includes(search.toLowerCase()) || reservation.customerPhone.includes(search);
    return statusMatch && dateMatch && searchMatch;
  });
  
  const handleUpdateStatus = async (reservationId: string, status: Reservation['status']) => {
    try {
      await reservationService.updateReservationStatus(reservationId, status);
      toast({
        title: "Estado actualizado",
        description: `La reserva ha sido marcada como ${status}.`,
      });
      await refreshReservations();
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la reserva.",
        variant: "destructive",
      });
    }
    setActionToConfirm(null);
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (printAreaRef.current) {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = printAreaRef.current;
        const today = new Date().toISOString().slice(0, 10);
        const opt = {
            margin:       0.5,
            filename:     `Reservas_${today}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    }
  };

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
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
              <span>{error.message || "Por favor, intente de nuevo más tarde."}</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredReservations.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
            No se encontraron reservas.
          </TableCell>
        </TableRow>
      );
    }
    
    return filteredReservations.map((reservation) => (
      <TableRow key={reservation.id}>
        <TableCell className="font-medium">{reservation.customerName}</TableCell>
        <TableCell>{format(new Date(reservation.dateTime), "MMM d, yyyy 'at' h:mm a")}</TableCell>
        <TableCell className="text-center">{reservation.numberOfGuests}</TableCell>
        <TableCell className="hidden sm:table-cell">{reservation.customerPhone}</TableCell>
        <TableCell className="text-center">{getStatusBadge(reservation.status)}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedReservation(reservation); setOpenDetail(true); }}>Ver detalles</DropdownMenuItem>
              {reservation.status === 'pending' && <DropdownMenuItem onClick={() => setActionToConfirm({ action: 'confirm', reservation })}>Confirmar</DropdownMenuItem>}
              {reservation.status !== 'cancelled' && reservation.status !== 'completed' && <DropdownMenuItem onClick={() => setActionToConfirm({ action: 'cancel', reservation })} className="text-destructive">Cancelar</DropdownMenuItem>}
              {reservation.status === 'confirmed' && <DropdownMenuItem onClick={() => setActionToConfirm({ action: 'complete', reservation })}>Marcar como Completada</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  }

  return (
    <div ref={printAreaRef} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Reservas</h1>
        <p className="text-lg text-muted-foreground">Descripción de la página de reservas</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Todas las reservas</CardTitle>
              <CardDescription>Descripción de la sección de todas las reservas</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="bg-green-500 text-white hover:bg-green-600">
                  <Printer className="mr-2 h-4 w-4"/> Imprimir
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf} className="bg-orange-500 text-white hover:bg-orange-600">
                  <Download className="mr-2 h-4 w-4"/> Descargar PDF
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o teléfono" className="pl-10"/>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto"><Filter className="mr-2 h-4 w-4" />Filtrar por estado</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>Todos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('confirmed')}>Confirmadas</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pendientes</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>Canceladas</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Completadas</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto"><CalendarDays className="mr-2 h-4 w-4" />Filtrar por fecha</Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={1}/>
                  <div className="flex justify-end p-2 border-t"><Button size="sm" variant="ghost" onClick={() => setDateRange(undefined)}>Limpiar</Button></div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del cliente</TableHead>
                <TableHead>Fecha y hora</TableHead>
                <TableHead className="text-center">Invitados</TableHead>
                <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableBody()}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la reserva</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-2 mt-2">
              <div><b>Nombre del cliente:</b> {selectedReservation.customerName}</div>
              <div><b>Teléfono:</b> {selectedReservation.customerPhone}</div>
               {selectedReservation.customerEmail && <div><b>Email:</b> {selectedReservation.customerEmail}</div>}
              <div><b>Fecha y hora:</b> {format(new Date(selectedReservation.dateTime), "PPPp")}</div>
              <div><b>Invitados:</b> {selectedReservation.numberOfGuests}</div>
              <div><b>Notas:</b> {selectedReservation.notes || 'Ninguna'}</div>
              <div className="flex items-center gap-2"><b>Estado:</b> {getStatusBadge(selectedReservation.status)}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!actionToConfirm} onOpenChange={() => setActionToConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Acción</DialogTitle>
            <DialogDescription>
              {actionToConfirm && `¿Estás seguro de que quieres ${actionToConfirm.action === 'confirm' ? 'confirmar' : actionToConfirm.action === 'cancel' ? 'cancelar' : 'marcar como completada'} la reserva para ${actionToConfirm.reservation.customerName}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionToConfirm(null)}>No, volver</Button>
            <Button 
              onClick={() => {
                if (actionToConfirm) {
                  const newStatus = actionToConfirm.action === 'confirm' ? 'confirmed' : actionToConfirm.action === 'cancel' ? 'cancelled' : 'completed';
                  handleUpdateStatus(actionToConfirm.reservation.id, newStatus);
                }
              }}
              className={actionToConfirm?.action === 'cancel' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              Sí, proceder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
