"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye, Search, Filter, CalendarDays, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDays, isWithinInterval } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

// Mock Data for Reservations
const mockReservations = [
  { id: "res-1", customerName: "Alice Wonderland", date: "2024-08-15T19:00:00Z", guests: 4, phone: "555-0101", status: "confirmed" },
  { id: "res-2", customerName: "Bob The Builder", date: "2024-08-16T20:30:00Z", guests: 2, phone: "555-0102", status: "pending" },
  { id: "res-3", customerName: "Charlie Brown", date: "2024-08-15T18:00:00Z", guests: 6, phone: "555-0103", status: "cancelled" },
  { id: "res-4", customerName: "Diana Prince", date: "2024-08-17T19:30:00Z", guests: 3, phone: "555-0104", status: "completed" },
];

export default function AdminReservationsPage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToAct, setReservationToAct] = useState<any | null>(null);
  const [reservations, setReservations] = useState(mockReservations);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusKey = `adminReservations.status.${status}`;
    const statusText = statusKey;
    switch (status) {
      case "confirmed": return <Badge className="bg-green-500 text-white hover:bg-green-600">{statusText}</Badge>;
      case "pending": return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">{statusText}</Badge>;
      case "cancelled": return <Badge variant="destructive">{statusText}</Badge>;
      case "completed": return <Badge variant="secondary">{statusText}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    // Filtrar por estado
    if (statusFilter && statusFilter !== 'all' && reservation.status !== statusFilter) return false;
    // Filtrar por rango de fechas
    if (dateRange?.from && dateRange?.to) {
      const resDate = new Date(reservation.date);
      if (!isWithinInterval(resDate, { start: dateRange.from, end: addDays(dateRange.to, 1) })) return false;
    }
    return true;
  });

  if (!isMounted) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Reservas</h1>
        <p className="text-lg text-muted-foreground">Descripción de la página de reservas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las reservas</CardTitle>
          <CardDescription>Descripción de la sección de todas las reservas</CardDescription>
          <div className="flex flex-col gap-2 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full gap-2 items-center">
              <div className="relative flex-grow min-w-[12rem] md:min-w-[20rem] lg:min-w-[28rem]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 transition-all w-full"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-auto">
                <Button
                  variant="outline"
                  asChild
                  className={`flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-background border border-border shadow-sm hover:shadow-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 ${statusFilter && statusFilter !== 'all' ? 'ring-2 ring-primary/40 bg-primary/10 text-primary' : ''}`}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="flex items-center w-full bg-background border border-border shadow-sm hover:shadow-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 px-4 py-2 rounded-md font-medium"
                      tabIndex={0}
                    >
                      <Filter className="mr-2 h-4 w-4" /> Filtrar por estado
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setStatusFilter('all')}>Todos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('confirmed')}>Confirmadas</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pendientes</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>Canceladas</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Completadas</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 rounded-md px-4 py-2 font-medium transition-all duration-200 shadow-sm hover:bg-primary/10 hover:text-primary ${dateRange?.from && dateRange?.to ? 'ring-2 ring-primary/40 bg-primary/10 text-primary' : ''}`}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" /> Filtrar por fecha
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-0">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      initialFocus
                    />
                    <div className="flex justify-end p-2">
                      <Button size="sm" variant="ghost" onClick={() => setDateRange(undefined)}>Limpiar filtro</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
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
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.customerName}</TableCell>
                  <TableCell>{format(new Date(reservation.date), "MMM d, yyyy 'at' h:mm a")}</TableCell>
                  <TableCell className="text-center">{reservation.guests}</TableCell>
                  <TableCell className="hidden sm:table-cell">{reservation.phone}</TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(reservation.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedReservation(reservation); setShowDetails(true); }}>
                          Ver detalles
                        </DropdownMenuItem>
                        {reservation.status === 'pending' && (
                          <DropdownMenuItem onClick={() => { setReservationToAct(reservation); setShowConfirmModal(true); }}>
                            Confirmar
                          </DropdownMenuItem>
                        )}
                        {reservation.status === 'pending' && (
                          <DropdownMenuItem onClick={() => { setReservationToAct(reservation); setShowCancelModal(true); }}>
                            Cancelar
                          </DropdownMenuItem>
                        )}
                        {reservation.status === 'confirmed' && (
                          <DropdownMenuItem onClick={() => { toast({ title: 'Reserva completada', description: `La reserva para ${reservation.customerName} se ha completado exitosamente`, variant: 'success' }); }}>
                            Completar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de detalles de reserva */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la reserva</DialogTitle>
            <DialogDescription>
              {selectedReservation && (
                <div className="space-y-2 mt-2">
                  <div><b>Nombre del cliente:</b> {selectedReservation.customerName}</div>
                  <div><b>Fecha y hora:</b> {format(new Date(selectedReservation.date), "MMM d, yyyy 'at' h:mm a")}</div>
                  <div><b>Invitados:</b> {selectedReservation.guests}</div>
                  <div><b>Teléfono:</b> {selectedReservation.phone}</div>
                  <div className="flex items-center gap-2"><b>Estado:</b> {getStatusBadge(selectedReservation.status)}</div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Modal de Confirmar Reserva */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar reserva</DialogTitle>
            <DialogDescription>
              {reservationToAct && (
                <div className="space-y-2 mt-2">
                  <div>{`¿Estás seguro de confirmar la reserva para ${reservationToAct.customerName}?`}</div>
                  <div className="flex gap-4 mt-4 justify-end">
                    <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
                    <Button variant="default" className="bg-green-600 text-white hover:bg-green-700" onClick={() => {
                      setReservations(prev => prev.map(r => r.id === reservationToAct.id ? { ...r, status: 'confirmed' } : r));
                      setShowConfirmModal(false);
                      toast({ title: 'Reserva confirmada', description: `La reserva para ${reservationToAct.customerName} se ha confirmado exitosamente`, variant: 'success' });
                    }}>Confirmar</Button>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Modal de Cancelar Reserva */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar reserva</DialogTitle>
            <DialogDescription>
              {reservationToAct && (
                <div className="space-y-2 mt-2">
                  <div>{`¿Estás seguro de cancelar la reserva para ${reservationToAct.customerName}?`}</div>
                  <div className="flex gap-4 mt-4 justify-end">
                    <Button variant="outline" onClick={() => setShowCancelModal(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={() => {
                      setReservations(prev => prev.map(r => r.id === reservationToAct.id ? { ...r, status: 'cancelled' } : r));
                      setShowCancelModal(false);
                      toast({ title: 'Reserva cancelada', description: `La reserva para ${reservationToAct.customerName} se ha cancelado exitosamente`, variant: 'destructive' });
                    }}>Cancelar reserva</Button>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
