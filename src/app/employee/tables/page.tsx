"use client";

import { useState, useEffect } from "react";
import { tableService, type Table } from "@/services/table-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, RefreshCw, AlertCircle } from "lucide-react";
import { useTables } from "@/hooks/use-tables";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/session-context";

export default function EmployeeTablesPage() {
  const { currentUser } = useSession();
  const companyId = currentUser?.companyId;
  const { tables, isLoading, isError, error, refreshTables } = useTables(companyId);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  // Filtrar mesas cuando cambien los filtros o los datos
  useEffect(() => {
    let filtered = tables;
    
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (table) =>
          table.number.toString().includes(searchTerm) ||
          table.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          table.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((table) => table.status === statusFilter);
    }
    
    setFilteredTables(filtered);
  }, [tables, searchTerm, statusFilter]);

  const handleStatusChange = async (table: Table) => {
    const newStatus = table.status === "available" ? "occupied" : "available";
    try {
      await tableService.changeTableStatus(table.id!, newStatus);
      toast({
        title: "Éxito",
        description: `Mesa ${table.number} marcada como ${newStatus === "available" ? "Disponible" : "Ocupada"}`,
      });
      await refreshTables(); // Refrescar los datos
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la mesa",
        variant: "destructive",
      });
    }
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
          <TableCell className="text-right"><Skeleton className="h-10 w-32 ml-auto" /></TableCell>
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
          <Badge className={tableService.getStatusColor(table.status)}>
            {tableService.getStatusText(table.status)}
          </Badge>
        </TableCell>
        <TableCell>{table.description || "-"}</TableCell>
        <TableCell className="text-right">
          <Button
            variant={table.status === "available" ? "default" : "secondary"}
            onClick={() => handleStatusChange(table)}
            disabled={table.status === "reserved" || table.status === "out_of_service"}
          >
            {table.status === "available" ? "Marcar Ocupada" : table.status === "occupied" ? "Marcar Disponible" : "-"}
          </Button>
        </TableCell>
      </TableRow>
    ));
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mesas del Restaurante</h1>
        <p className="text-muted-foreground">Visualiza y gestiona el estado de las mesas</p>
      </div>
      
      {/* Filtros de búsqueda */}
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
             <Button onClick={() => refreshTables()} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refrescar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

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
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableContent()}
            </TableBody>
          </UITable>
        </CardContent>
      </Card>
    </div>
  );
}
