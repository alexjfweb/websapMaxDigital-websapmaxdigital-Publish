"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Clock, Users, AlertCircle, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { tableService, type Table, type TableStatus } from "@/services/table-service";
import { TableForm } from "./table-form";
import { TableLogsDialog } from "./table-logs-dialog";
import { useTables } from "@/hooks/use-tables";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/session-context";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { useSubscription } from "@/hooks/use-subscription";
import LimitReachedDialog from "@/components/LimitReachedDialog";

export default function TablesPage() {
  const { currentUser } = useSession();
  const companyId = currentUser?.companyId;
  const { tables, isLoading, isError, error, refreshTables } = useTables(companyId);
  const { limits, isLimitsLoading } = usePlanLimits();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedTableForLogs, setSelectedTableForLogs] = useState<Table | null>(null);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const { toast } = useToast();
  const printAreaRef = useRef<HTMLDivElement>(null);


  const filteredTables = useMemo(() => {
    let filtered = tables;
    if (searchTerm) {
      filtered = filtered.filter(
        (table) =>
          table.number.toString().includes(searchTerm) ||
          table.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          table.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((table) => table.status === statusFilter);
    }
    return filtered;
  }, [tables, searchTerm, statusFilter]);

  const handleOpenNewTableForm = () => {
    if (limits.reached.tables) {
        setIsLimitModalOpen(true);
    } else {
        setEditingTable(null);
        setIsFormOpen(true);
    }
  };

  const handleStatusChange = async (tableId: string, newStatus: Table["status"]) => {
    try {
      await tableService.changeTableStatus(tableId, newStatus);
      await refreshTables();
      toast({
        title: "Éxito",
        description: "Estado de mesa actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la mesa",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (tableId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta mesa?")) return;
    try {
      await tableService.deleteTable(tableId);
      await refreshTables();
      toast({
        title: "Éxito",
        description: "Mesa eliminada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la mesa",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async () => {
    await refreshTables();
    setIsFormOpen(false);
    setEditingTable(null);
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
            filename:     `Mesas_${today}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    }
  };

  const getStatusColor = (status: Table["status"]) => {
    return tableService.getStatusColor(status);
  };

  const getStatusText = (status: Table["status"]) => {
    return tableService.getStatusText(status);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ));
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-red-500 py-8">
            <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8" />
                <span className="font-semibold">Error al cargar las mesas.</span>
                <span>{error?.message || "Por favor, intente de nuevo más tarde."}</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredTables.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
            No se encontraron mesas.
          </TableCell>
        </TableRow>
      );
    }
    
    return filteredTables.map((table) => (
      <TableRow key={table.id}>
        <TableCell className="font-medium">Mesa {table.number}</TableCell>
        <TableCell>{table.capacity} personas</TableCell>
        <TableCell>{table.location || "-"}</TableCell>
        <TableCell>
          <Badge className={getStatusColor(table.status)}>
            {getStatusText(table.status)}
          </Badge>
        </TableCell>
        <TableCell>{table.description || "-"}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setEditingTable(table);
                setIsFormOpen(true);
              }}>
                <Edit className="w-4 h-4 mr-2" />Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedTableForLogs(table)}>
                <Eye className="w-4 h-4 mr-2" />Ver Logs
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(table.id!, "available")}
                disabled={table.status === "available"}
              >
                <Clock className="w-4 h-4 mr-2" />Marcar Disponible
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(table.id!, "occupied")}
                disabled={table.status === "occupied"}
              >
                <Users className="w-4 h-4 mr-2" />Marcar Ocupada
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(table.id!)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  }

  return (
    <>
    <LimitReachedDialog 
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        limitType="mesas"
        limit={limits.max.tables}
        planName={subscription?.plan?.name || ''}
    />
    <div className="space-y-6" ref={printAreaRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Mesas</h1>
          <p className="text-muted-foreground">Administra las mesas del restaurante. Límite del plan: {limits.current.tables}/{limits.max.tables < 0 ? 'Ilimitadas' : limits.max.tables}</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <Button onClick={handleOpenNewTableForm}>
            <Plus className="w-4 h-4 mr-2" />Nueva Mesa
          </Button>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTable ? "Editar Mesa" : "Nueva Mesa"}</DialogTitle>
            </DialogHeader>
            <TableForm
              table={editingTable}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              companyId={companyId}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por número, ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todos los estados</option>
              <option value="available">Disponible</option>
              <option value="occupied">Ocupada</option>
              <option value="reserved">Reservada</option>
              <option value="out_of_service">Fuera de servicio</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vista de Tabla (Desktop) */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mesas ({filteredTables.length})</CardTitle>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint} className="bg-green-500 text-white hover:bg-green-600">
                    <Printer className="mr-2 h-4 w-4"/> Imprimir
                </Button>
                <Button variant="outline" onClick={handleDownloadPdf} className="bg-orange-500 text-white hover:bg-orange-600">
                    <Download className="mr-2 h-4 w-4"/> Descargar PDF
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableContent()}
              </TableBody>
            </UITable>
          </CardContent>
        </Card>
      </div>

      {/* Vista de Tarjetas (Mobile) */}
      <div className="lg:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTables.map((table) => (
            <Card key={table.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Mesa {table.number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Capacidad: {table.capacity} personas
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingTable(table);
                        setIsFormOpen(true);
                      }}>
                        <Edit className="w-4 h-4 mr-2" />Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedTableForLogs(table)}>
                        <Eye className="w-4 h-4 mr-2" />Ver Logs
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(table.id!, "available")}
                        disabled={table.status === "available"}
                      >
                        <Clock className="w-4 h-4 mr-2" />Marcar Disponible
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(table.id!, "occupied")}
                        disabled={table.status === "occupied"}
                      >
                        <Users className="w-4 h-4 mr-2" />Marcar Ocupada
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(table.id!)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ubicación:</span>
                    <span className="text-sm">{table.location || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <Badge className={getStatusColor(table.status)}>
                      {getStatusText(table.status)}
                    </Badge>
                  </div>
                  {table.description && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Descripción:</span>
                      <span className="text-sm text-right">{table.description}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog para Logs */}
      {selectedTableForLogs && (
        <TableLogsDialog
          table={selectedTableForLogs}
          open={!!selectedTableForLogs}
          onOpenChange={(open) => !open && setSelectedTableForLogs(null)}
        />
      )}
    </div>
    </>
  );
}
