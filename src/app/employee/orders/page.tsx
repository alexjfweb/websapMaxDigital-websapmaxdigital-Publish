"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, Truck, Search, Filter, Printer, ShoppingBag } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useOrderContext } from '@/contexts/order-context';
import { tableService } from '@/services/table-service';

export default function EmployeeOrdersPage() {
  const { orders, addOrder, updateOrder, loading } = useOrderContext();
  const [isMounted, setIsMounted] = useState(false);
  const [openKOT, setOpenKOT] = useState(false);
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("active");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openPrepare, setOpenPrepare] = useState(false);
  const [openDelivery, setOpenDelivery] = useState(false);
  const [openReady, setOpenReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reemplazar mockOrders por orders del contexto
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  // Mapeo de status del mock a las claves de traducción
  const statusKeyMap: Record<string, string> = {
    pending: 'pending',
    preparing: 'preparing',
    ready_for_pickup: 'readyForPickup',
    out_for_delivery: 'outForDelivery',
    completed: 'completed',
    cancelled: 'cancelled'
  };

  // Estados posibles para cada tab
  const activeStatuses = [
    "all",
    "pending",
    "preparing",
    "ready_for_pickup",
    "out_for_delivery"
  ];
  const pastStatuses = [
    "all",
    "completed",
    "cancelled"
  ];

  // Opciones de estado traducidas
  const getStatusOptions = () => {
    const options = activeTab === "active" ? activeStatuses : pastStatuses;
    return options.map((status) => ({
      value: status,
      label:
        status === "all"
          ? 'Todos'
          : status === "pending"
            ? 'Pendiente'
            : status === "preparing"
              ? 'En preparación'
              : status === "ready_for_pickup"
                ? 'Listo para recoger'
                : status === "out_for_delivery"
                  ? 'En reparto'
                  : status === "completed"
                    ? 'Completado'
                    : 'Cancelado'
    }));
  };

  // Filtrado de pedidos según tab y estado
  const filteredActiveOrders = activeOrders.filter((o) =>
    selectedStatus === "all" ? true : o.status === selectedStatus
  );
  const filteredPastOrders = pastOrders.filter((o) =>
    selectedStatus === "all" ? true : o.status === selectedStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-orange-500 text-white hover:bg-orange-600">Pendiente</Badge>;
      case "preparing": return <Badge className="bg-blue-500 text-white hover:bg-blue-600">En preparación</Badge>;
      case "ready_for_pickup": return <Badge className="bg-purple-500 text-white hover:bg-purple-600">Listo para recoger</Badge>;
      case "out_for_delivery": return <Badge className="bg-teal-500 text-white hover:bg-teal-600">En reparto</Badge>;
      case "completed": return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">Completado</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Funciones para abrir cada modal
  const handleOpenDetail = (order: any) => { setSelectedOrder(order); setOpenDetail(true); };
  const handleOpenPrepare = (order: any) => { setSelectedOrder(order); setOpenPrepare(true); };
  const handleOpenDelivery = (order: any) => { setSelectedOrder(order); setOpenDelivery(true); };
  const handleOpenReady = (order: any) => { setSelectedOrder(order); setOpenReady(true); };
  const handleCloseModals = () => { setOpenDetail(false); setOpenPrepare(false); setOpenDelivery(false); setOpenReady(false); setSelectedOrder(null); };

  const orderStatuses = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'preparing', label: 'En preparación' },
    { value: 'ready_for_pickup', label: 'Listo para recoger' },
    { value: 'out_for_delivery', label: 'En reparto' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  if (!isMounted || loading) {
    return <div className="flex justify-center items-center min-h-[40vh] text-lg text-muted-foreground">Cargando pedidos...</div>;
  }

  const renderOrderTable = (orders: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="hidden sm:table-cell">Fecha</TableHead>
          <TableHead className="text-center">Items</TableHead>
          <TableHead className="text-center">Mesa</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-center">Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-xs">{order.id}</TableCell>
            <TableCell className="font-medium">{order.customerName}</TableCell>
            <TableCell className="hidden sm:table-cell">{format(new Date(order.date), "MMM d, h:mm a")}</TableCell>
            <TableCell className="text-center">{order.items}</TableCell>
            <TableCell className="text-center">{order.mesa?.tableNumber ? `Mesa ${order.mesa.tableNumber}` : 'Para llevar'}</TableCell>
            <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
            <TableCell className="text-center">
              <select
                value={order.status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  if ((newStatus === 'completed' || newStatus === 'cancelled') && order.mesa?.tableId) {
                    await tableService.changeTableStatus(order.mesa.tableId, 'available');
                  }
                  if (typeof updateOrder === 'function') {
                    updateOrder(order.id, { status: newStatus });
                  }
                }}
                className="border rounded px-2 py-1"
              >
                {orderStatuses.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:text-primary" 
                  title="Ver detalles"
                  onClick={() => handleOpenDetail(order)}
                >
                  <span className="sr-only">Ver detalles</span>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {orders.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
              No hay pedidos
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  // Función para imprimir solo la sección de KOTs
  const handlePrintKOT = () => {
    const printContents = document.getElementById('kot-print-area')?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '', 'height=600,width=400');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Imprimir KOTs</title>
            <style>
              body { font-family: monospace; margin: 0; padding: 20px; background: #fff; }
              .ticket { border-bottom: 1px dashed #888; margin-bottom: 16px; padding-bottom: 12px; }
              .ticket:last-child { border-bottom: none; }
              .ticket-title { font-weight: bold; font-size: 1.1em; margin-bottom: 4px; }
              .ticket-row { margin-bottom: 2px; }
              .ticket-status { font-size: 0.95em; font-weight: bold; }
            </style>
          </head>
          <body onload="window.print();window.close()">
            <h2 style="text-align:center;">Impresión de KOTs</h2>
            ${printContents}
          </body>
        </html>
      `);
      printWindow?.document.close();
      toast({ title: 'KOTs impresos exitosamente', description: 'La impresión se ha completado correctamente', variant: 'default' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Pedidos del empleado</h1>
        <p className="text-lg text-muted-foreground">Gestiona y administra tus pedidos</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle>Resumen</CardTitle>
            <div className="flex gap-2">
              <Dialog open={openKOT} onOpenChange={setOpenKOT}>
                <DialogTrigger asChild>
                  <Button variant="outline"><Printer className="mr-2 h-4 w-4"/> Imprimir KOTs</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Imprimir KOTs</DialogTitle>
                    <DialogDescription>Imprime los tickets de cocina (KOTs) para los pedidos activos.</DialogDescription>
                  </DialogHeader>
                  {/* Vista previa de impresión de KOTs */}
                  <div id="kot-print-area" className="max-h-96 overflow-auto border rounded p-4 bg-muted mb-4">
                    {activeOrders.map(order => (
                      <div key={order.id} className="ticket">
                        <div className="ticket-title">ID: {order.id}</div>
                        <div className="ticket-row">Cliente: {order.customerName}</div>
                        <div className="ticket-row">Items: {order.items}</div>
                        <div className="ticket-row">Fecha: {format(new Date(order.date), 'MMM d, h:mm a')}</div>
                        <div className="ticket-row">Tipo: {order.type === 'delivery' ? 'Domicilio' : 'Recoger en local'}</div>
                        <div className="ticket-row ticket-status">
                          Estado:
                          <span className="inline print:hidden">
                            {getStatusBadge(order.status)}
                          </span>
                          <span className="hidden print:inline">
                            {order.status === 'pending' ? 'Pendiente' : order.status === 'preparing' ? 'En preparación' : order.status === 'ready_for_pickup' ? 'Listo para recoger' : order.status === 'out_for_delivery' ? 'En reparto' : order.status === 'completed' ? 'Completado' : 'Cancelado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button onClick={handlePrintKOT}>Imprimir ahora</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <CardDescription>Resumen de pedidos</CardDescription>
           <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar pedido" className="pl-8" />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="active">Pedidos activos ({activeOrders.length})</TabsTrigger>
              <TabsTrigger value="past">Pedidos finalizados ({pastOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {renderOrderTable(filteredActiveOrders)}
            </TabsContent>
            <TabsContent value="past">
              {renderOrderTable(filteredPastOrders)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* Modales de acciones */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ver detalles</DialogTitle>
            <DialogDescription>Resumen del pedido</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-2 text-base">
              <div><b>ID:</b> {selectedOrder.id}</div>
              <div><b>Cliente:</b> {selectedOrder.customerName}</div>
              <div><b>Fecha:</b> {format(new Date(selectedOrder.date), 'PPPp')}</div>
              <div><b>Items:</b> {selectedOrder.items}</div>
              <div><b>Total:</b> ${selectedOrder.total.toFixed(2)}</div>
              <div><b>Tipo:</b> {selectedOrder?.type === 'delivery' ? 'Domicilio' : 'Recoger en local'}</div>
              <div className="flex items-center gap-2"><b>Estado:</b> {getStatusBadge(selectedOrder.status)}</div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseModals}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openPrepare} onOpenChange={setOpenPrepare}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar como en preparación</DialogTitle>
            <DialogDescription>Resumen del pedido</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <span className="text-lg font-semibold">ID: {selectedOrder?.id}</span>
            <div className="mt-2 text-muted-foreground">¿Estás seguro de marcar este pedido como en preparación?</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleCloseModals}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openDelivery} onOpenChange={setOpenDelivery}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar como en reparto</DialogTitle>
            <DialogDescription>Resumen del pedido</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <span className="text-lg font-semibold">ID: {selectedOrder?.id}</span>
            <div className="mt-2 text-muted-foreground">¿Estás seguro de marcar este pedido como en reparto?</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleCloseModals}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openReady} onOpenChange={setOpenReady}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar como listo para recoger</DialogTitle>
            <DialogDescription>Resumen del pedido</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <span className="text-lg font-semibold">ID: {selectedOrder?.id}</span>
            <div className="mt-2 text-muted-foreground">¿Estás seguro de marcar este pedido como listo para recoger?</div>
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
