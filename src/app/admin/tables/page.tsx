"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { tableService, type Table } from "@/services/table-service";
import { TableForm } from "./table-form";
import { TableLogsDialog } from "./table-logs-dialog";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedTableForLogs, setSelectedTableForLogs] = useState<Table | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTables();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    filterTables();
    // eslint-disable-next-line
  }, [tables, searchTerm, statusFilter]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await tableService.getAllTables('websapmax');
      console.log('DEBUG MESAS DESDE FIRESTORE:', data);
      setTables(data);
    } catch (error) {
      console.error('ERROR AL CARGAR MESAS:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las mesas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTables = () => {
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
    setFilteredTables(filtered);
  };

  const handleStatusChange = async (tableId: string, newStatus: Table["status"]) => {
    try {
      await tableService.changeTableStatus(tableId, newStatus);
      await loadTables();
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
      await loadTables();
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
    await loadTables();
    setIsFormOpen(false);
    setEditingTable(null);
  };

  const getStatusColor = (status: Table["status"]) => {
    return tableService.getStatusColor(status);
  };

  const getStatusText = (status: Table["status"]) => {
    return tableService.getStatusText(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando mesas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Mesas</h1>
          <p className="text-muted-foreground">Administra las mesas del restaurante</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTable(null)}>
              <Plus className="w-4 h-4 mr-2" />Nueva Mesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTable ? "Editar Mesa" : "Nueva Mesa"}</DialogTitle>
            </DialogHeader>
            <TableForm
              table={editingTable}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
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
          <CardHeader>
            <CardTitle>Mesas ({filteredTables.length})</CardTitle>
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
                {filteredTables.map((table) => (
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
                ))}
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
  );
}
