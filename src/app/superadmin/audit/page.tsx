
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Filter, Eye, Archive } from "lucide-react";
import { auditService, AuditLog } from "@/services/audit-service";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    entity: 'all',
    action: 'all',
    searchTerm: '',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [filters.entity, filters.action]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await auditService.getLogs({
        entity: filters.entity === 'all' ? undefined : filters.entity,
        action: filters.action === 'all' ? undefined : filters.action,
      });
      setLogs(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const filteredLogs = logs.filter(log => {
    const searchTerm = filters.searchTerm.toLowerCase();
    if (!searchTerm) return true;
    return (
      log.entity.toLowerCase().includes(searchTerm) ||
      log.entityId.toLowerCase().includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm) ||
      log.performedBy.email.toLowerCase().includes(searchTerm)
    );
  });
  
  const getActionBadge = (action: string) => {
    switch (action) {
        case 'created': return <Badge variant="default" className="bg-green-500 text-white">Creado</Badge>;
        case 'updated': return <Badge variant="secondary" className="bg-blue-500 text-white">Actualizado</Badge>;
        case 'deleted': return <Badge variant="destructive">Eliminado</Badge>;
        case 'reordered': return <Badge className="bg-purple-500 text-white">Reordenado</Badge>;
        default: return <Badge variant="outline">{action}</Badge>;
    }
  };
  
  const getEntityText = (entity: string) => {
    const map: Record<string, string> = {
      landingPlans: "Planes",
      companies: "Empresas",
      users: "Usuarios"
    };
    return map[entity] || entity;
  }
  
  const renderLogTable = () => {
    if (isLoading) {
      return Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
        </TableRow>
      ));
    }
    if (filteredLogs.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
            No se encontraron registros de auditoría.
          </TableCell>
        </TableRow>
      );
    }
    return filteredLogs.map(log => {
      // El timestamp ya es un objeto Date gracias al service
      const dateObject = log.timestamp;

      return (
        <TableRow key={log.id}>
          <TableCell>{format(dateObject, "dd/MM/yyyy HH:mm:ss", { locale: es })}</TableCell>
          <TableCell>{getEntityText(log.entity)}</TableCell>
          <TableCell>{getActionBadge(log.action)}</TableCell>
          <TableCell>{log.performedBy.email}</TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedLog(log); setIsDetailModalOpen(true); }}>
              <Eye className="h-4 w-4"/>
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  }


  return (
    <div className="space-y-8">
       <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><Archive className="h-8 w-8"/>Auditoría Global</h1>
          <p className="text-lg text-muted-foreground">Historial de acciones críticas en el sistema.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Filtros de Búsqueda</CardTitle>
                <CardDescription>Filtra los registros para encontrar lo que necesitas.</CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                    <Input 
                        placeholder="Buscar por email, entidad, ID..."
                        value={filters.searchTerm}
                        onChange={handleSearchChange}
                        className="md:col-span-2"
                    />
                    <Select value={filters.entity} onValueChange={(val) => setFilters(prev => ({...prev, entity: val}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Entidades</SelectItem>
                            <SelectItem value="landingPlans">Planes</SelectItem>
                            <SelectItem value="companies">Empresas</SelectItem>
                            <SelectItem value="users">Usuarios</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={filters.action} onValueChange={(val) => setFilters(prev => ({...prev, action: val}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Acciones</SelectItem>
                            <SelectItem value="created">Creado</SelectItem>
                            <SelectItem value="updated">Actualizado</SelectItem>
                            <SelectItem value="deleted">Eliminado</SelectItem>
                            <SelectItem value="reordered">Reordenado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Entidad</TableHead>
                            <TableHead>Acción</TableHead>
                            <TableHead>Realizado por</TableHead>
                            <TableHead className="text-right">Detalles</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{renderLogTable()}</TableBody>
                </Table>
            </CardContent>
        </Card>
        
        {/* Modal de Detalles */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Detalle del Registro de Auditoría</DialogTitle>
                </DialogHeader>
                {selectedLog && (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong>ID del Log:</strong> {selectedLog.id}</p>
                        <p><strong>Entidad:</strong> {getEntityText(selectedLog.entity)}</p>
                        <p><strong>ID de Entidad:</strong> {selectedLog.entityId}</p>
                        <p><strong>Acción:</strong> {getActionBadge(selectedLog.action)}</p>
                        <p><strong>Usuario:</strong> {selectedLog.performedBy.email}</p>
                        <p><strong>Fecha:</strong> {format(selectedLog.timestamp, "PPPp", { locale: es })}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Datos Anteriores</h4>
                          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                            {JSON.stringify(selectedLog.previousData || {}, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Datos Nuevos</h4>
                          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                            {JSON.stringify(selectedLog.newData || {}, null, 2)}
                          </pre>
                        </div>
                      </div>
                       {selectedLog.diff && Object.keys(selectedLog.diff).length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Diferencias</h4>
                            <div className="bg-muted p-3 rounded-md text-xs overflow-auto">
                              {Object.entries(selectedLog.diff).map(([key, value]) => (
                                <div key={key} className="mb-1">
                                  <strong className="text-primary">{key}:</strong> 
                                  <span className="text-red-600"> {JSON.stringify(value.from)}</span> → 
                                  <span className="text-green-600"> {JSON.stringify(value.to)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                       )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
  )
}
