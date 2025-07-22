"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, ListTree, FileText, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';

// Mock Data
const dbStatus = {
  status: "Connected",
  latency: "25ms",
  collections: 6,
  documents: 184,
};

const collectionsData = [
  { name: "users", count: 150 },
  { name: "companies", count: 5 },
  { name: "dishes", count: 25 },
  { name: "orders", count: 1250 },
  { name: "reservations", count: 20 },
  { name: "logs", count: 5000 },
];

// Mock de datos por colección para exportar
const mockCollectionDocs: Record<string, any[]> = {
  users: [
    { id: 1, name: "Juan", email: "juan@email.com" },
    { id: 2, name: "Ana", email: "ana@email.com" },
  ],
  companies: [
    { id: 1, name: "Empresa S.A." },
  ],
  dishes: [
    { id: 1, name: "Pizza", price: 25000 },
  ],
  orders: [
    { id: 1, user: "Juan", total: 50000 },
  ],
  reservations: [
    { id: 1, user: "Ana", date: "2024-06-01" },
  ],
  logs: [
    { id: 1, action: "login", user: "Juan" },
  ],
};

export default function SuperAdminDatabasePage() {
  const { toast } = useToast();
  const [selectedCollection, setSelectedCollection] = useState<{ name: string, count: number } | null>(null);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleTestConnection = () => {
    toast({
      title: 'Probando conexión',
      description: 'Por favor, espere mientras se prueba la conexión...',
    });
    // Simulate a successful connection test
    setTimeout(() => {
        toast({
            title: 'Conexión exitosa',
            description: `Conexión exitosa. Latencia: ${dbStatus.latency}`,
        });
    }, 1500);
  };

  const handleOpenView = (col: { name: string, count: number }) => { setSelectedCollection(col); setOpenView(true); };
  const handleOpenDelete = (col: { name: string, count: number }) => { setSelectedCollection(col); setOpenDelete(true); };
  const handleCloseModals = () => { setOpenView(false); setOpenDelete(false); setSelectedCollection(null); };
  const handleExport = (col: { name: string, count: number }) => {
    // Obtener los datos mock de la colección
    const docs = mockCollectionDocs[col.name] || [];
    const json = JSON.stringify(docs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${col.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ 
      title: 'Exportación iniciada', 
      description: `La colección ${col.name} se está exportando.` 
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Base de datos</h1>
        <p className="text-lg text-muted-foreground">Descripción de la sección de base de datos</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Conectado</div>
            <p className="text-xs text-muted-foreground">Estado actual de la conexión</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latencia</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStatus.latency}</div>
            <p className="text-xs text-muted-foreground">Tiempo de respuesta del servidor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colecciones</CardTitle>
            <ListTree className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStatus.collections}</div>
            <p className="text-xs text-muted-foreground">Total de colecciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStatus.documents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total de documentos</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Collections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Colecciones</CardTitle>
          <CardDescription>Lista de colecciones disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collectionsData.map((collection) => (
                <TableRow key={collection.name}>
                  <TableCell className="font-mono text-sm">{collection.name}</TableCell>
                  <TableCell className="text-right">{collection.count.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" title="Ver documentos">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleOpenView(collection)}>
                          Ver documentos
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleExport(collection)}>
                          Exportar colección
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOpenDelete(collection)} className="text-destructive">
                          Eliminar colección
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>Acciones disponibles para la base de datos</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleTestConnection}>
                <RefreshCw className="mr-2 h-4 w-4"/>
                Probar conexión
            </Button>
        </CardContent>
      </Card>

      {/* Modales de acciones */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ver documentos</DialogTitle>
            <DialogDescription>{selectedCollection?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-2 text-center text-muted-foreground">
            <p>Vista de documentos próximamente.</p>
            <p className="mt-2 text-sm">Cantidad de documentos: <b>{selectedCollection?.count}</b></p>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseModals}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar colección</DialogTitle>
            <DialogDescription>¿Seguro que deseas eliminar esta colección?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleCloseModals} variant="destructive">Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
