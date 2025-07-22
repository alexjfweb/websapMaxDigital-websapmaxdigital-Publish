"use client";

import { useState, useEffect } from "react";
import { tableService, type Table } from "@/services/table-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { onSnapshot, query, where, orderBy, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search } from "lucide-react";

export default function EmployeeTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Listener en tiempo real para las mesas activas del restaurante
    const q = query(
      collection(db, "tables"),
      where("isActive", "==", true),
      where("restaurantId", "==", "websapmax"),
      orderBy("number", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mesas = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          number: data.number,
          capacity: data.capacity,
          status: data.status,
          isActive: data.isActive,
          location: data.location,
          description: data.description,
          restaurantId: data.restaurantId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as Table;
      });
      console.log("DEBUG MESAS EMPLEADO:", mesas);
      setTables(mesas);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      console.error("ERROR MESAS EMPLEADO:", error);
    });
    return () => unsubscribe();
  }, []);

  // Filtrar mesas cuando cambien los filtros
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
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la mesa",
        variant: "destructive",
      });
    }
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
              {filteredTables.map((table) => (
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
              ))}
            </TableBody>
          </UITable>
        </CardContent>
      </Card>
    </div>
  );
} 