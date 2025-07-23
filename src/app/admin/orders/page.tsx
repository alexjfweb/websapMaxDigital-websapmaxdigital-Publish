
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
import { useOrderContext, type Order } from '@/contexts/order-context';
import { tableService } from '@/services/table-service';

export default function AdminOrdersPage() {
  const { orders, updateOrder, loading } = useOrderContext();
  const [isMounted, setIsMounted] = useState(false);
  const [openKOT, setOpenKOT] = useState(false);
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("active");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  const activeStatuses = [
    "all", "pending", "preparing", "ready_for_pickup", "out_for_delivery"
  ];
  const pastStatuses = ["all", "completed", "cancelled"];

  const getStatusOptions = () => {
    const options = activeTab === "active" ? activeStatuses : pastStatuses;
    return options.map((status) => ({
      value: status,
      label: status === "all" ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
    }));
  };

  const filteredActiveOrders = activeOrders.filter((o) => selectedStatus === "all" || o.status === selectedStatus);
  const filteredPastOrders = pastOrders.filter((o) => selectedStatus === "all" || o.status === selectedStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-orange-500 text-white hover:bg-orange-600">Pendiente</Badge>;
      case "preparing": return <Badge className="bg-blue-500 text-white hover:bg-blue-600">En preparación</Badge>;
      case "ready_for_pickup": return <Badge className="bg-purple-500 text-white hover:bg-purple-600">Listo</Badge>;
      case "out_for_delivery": return <Badge className="bg-teal-500 text-white hover:bg-teal-600">En reparto</Badge>;
      case "completed": return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">Completado</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenDetail = (order: Order) => { setSelectedOrder(order); setOpenDetail(true); };

  if (!isMounted || loading) {
    return <div className="flex justify-center items-center min-h-[40vh] text-lg text-muted-foreground">Cargando pedidos...</div>;
  }

  const orderStatuses = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'preparing', label: 'En preparación' },
    { value: 'ready_for_pickup', label: 'Listo para recoger' },
    { value: 'out_for_delivery', label: 'En reparto' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  const renderOrderTable = (currentOrders: Order[]) => (
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
        {currentOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
            <TableCell className="font-medium">{order.customerName}</TableCell>
            <TableCell className="hidden sm:table-cell">{format(new Date(order.date), "MMM d, h:mm a")}</TableCell>
            <TableCell className="text-center">{order.items}</TableCell>
            <TableCell className="text-center">{order.mesa?.tableNumber ? `Mesa ${order.mesa.tableNumber}` : 'Para llevar'}</TableCell>
            <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
            <TableCell className="text-center">
              <Select
                value={order.status}
                onValueChange={async (newStatus: Order['status']) => {
                  if ((newStatus === 'completed' || newStatus === 'cancelled') && order.mesa?.tableId) {
                    await tableService.changeTableStatus(order.mesa.tableId, 'available');
                  }
                  await updateOrder(order.id, { status: newStatus });
                }}
              >
                <SelectTrigger className="w-[150px] text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="hover:text-primary" title="Ver detalles" onClick={() => handleOpenDetail(order)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {currentOrders.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No hay pedidos</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const handlePrintKOT = () => {
    // Implementación de impresión
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Gestión de pedidos</h1>
        <p className="text-lg text-muted-foreground">Gestiona y administra tus pedidos de manera eficiente</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle>Resumen</CardTitle>
            <Button variant="outline" onClick={() => setOpenKOT(true)}><Printer className="mr-2 h-4 w-4"/> Imprimir KOTs</Button>
          </div>
          <CardDescription>Resumen de pedidos</CardDescription>
           <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar" className="pl-8" />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
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
            <TabsContent value="active">{renderOrderTable(filteredActiveOrders)}</TabsContent>
            <TabsContent value="past">{renderOrderTable(filteredPastOrders)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Ver detalles</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-2 text-base">
              <div><b>ID:</b> {selectedOrder.id}</div>
              <div><b>Cliente:</b> {selectedOrder.customerName}</div>
              <div><b>Fecha:</b> {format(new Date(selectedOrder.date), 'PPPp')}</div>
              <div><b>Items:</b> {selectedOrder.items}</div>
              <div><b>Total:</b> ${selectedOrder.total.toFixed(2)}</div>
              <div><b>Tipo:</b> {selectedOrder.type === 'delivery' ? 'Domicilio' : selectedOrder.type === 'pickup' ? 'Recoger' : 'En local'}</div>
              <div className="flex items-center gap-2"><b>Estado:</b> {getStatusBadge(selectedOrder.status)}</div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setOpenDetail(false)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
