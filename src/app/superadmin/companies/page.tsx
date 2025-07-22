"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Filter, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Company } from "@/types";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Mock Data for Companies
const mockCompanies: Company[] = [
  { id: "com-1", name: "websapMax Restaurant", location: "Flavor Town", status: "active", registrationDate: "2023-01-15T00:00:00Z" },
  { id: "com-2", name: "The Burger Joint", location: "Metropolis", status: "active", registrationDate: "2023-03-20T00:00:00Z" },
  { id: "com-3", name: "Pizza Palace", location: "Gotham City", status: "inactive", registrationDate: "2023-05-10T00:00:00Z" },
  { id: "com-4", name: "Sushi Central", location: "Star City", status: "pending", registrationDate: "2024-07-28T00:00:00Z" },
  { id: "com-5", name: "Taco Tuesday", location: "Central City", status: "active", registrationDate: "2023-09-01T00:00:00Z" },
];

export default function SuperAdminCompaniesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; location: string; status: string }>({ name: '', location: '', status: 'active' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Traducciones directas en español para estados
  const statusTranslations = {
    all: "Todos",
    active: "Activo",
    inactive: "Inactivo",
    pending: "Pendiente"
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getStatusBadge = (status: Company['status']) => {
    const statusText = statusTranslations[status] || status;
    switch (status) {
      case "active": 
        return <Badge className="bg-green-500 text-white hover:bg-green-600">{statusText}</Badge>;
      case "inactive": 
        return <Badge variant="destructive">{statusText}</Badge>;
      case "pending": 
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">{statusText}</Badge>;
      default: 
        return <Badge variant="outline">{statusText}</Badge>;
    }
  };

  // Filtrado combinado por estado y búsqueda
  const filteredCompanies = companies.filter(company => {
    const statusMatch = statusFilter === "all" || company.status === statusFilter;
    const searchMatch =
      !searchTerm ||
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && searchMatch;
  });

  // Ver empresa
  const handleView = (company: Company) => {
    console.log('Ver empresa:', company);
    setSelectedCompany(company);
    setViewModalOpen(true);
  };

  // Editar empresa
  const handleEdit = (company: Company) => {
    console.log('Editar empresa:', company);
    setSelectedCompany(company);
    setEditForm({ name: company.name, location: company.location, status: company.status });
    setEditModalOpen(true);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSave = () => {
    setLoading(true);
    setTimeout(() => { // Simula llamada a API
      setCompanies(prev => prev.map(c => c.id === selectedCompany?.id ? { ...c, ...editForm } : c));
      setEditModalOpen(false);
      setLoading(false);
      setFeedback({ type: 'success', message: 'Empresa actualizada correctamente.' });
    }, 1000);
  };

  // Eliminar empresa
  const handleDelete = (company: Company) => {
    console.log('Eliminar empresa:', company);
    setSelectedCompany(company);
    setDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    setLoading(true);
    setTimeout(() => { // Simula llamada a API
      setCompanies(prev => prev.filter(c => c.id !== selectedCompany?.id));
      setDeleteModalOpen(false);
      setLoading(false);
      setFeedback({ type: 'success', message: 'Empresa eliminada correctamente.' });
    }, 1000);
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Empresas</h1>
          <p className="text-lg text-muted-foreground">Descripción de la página de empresas</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Registrar nueva empresa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las empresas</CardTitle>
          <CardDescription>Descripción de la sección de todas las empresas</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 min-w-[170px]">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar por estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setStatusFilter("all")} className={statusFilter === "all" ? "font-bold text-primary" : ""}>{statusTranslations.all}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatusFilter("active")} className={statusFilter === "active" ? "font-bold text-green-600" : ""}>{statusTranslations.active}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatusFilter("inactive")} className={statusFilter === "inactive" ? "font-bold text-red-600" : ""}>{statusTranslations.inactive}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatusFilter("pending")} className={statusFilter === "pending" ? "font-bold text-yellow-600" : ""}>{statusTranslations.pending}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Ubicación</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="hidden md:table-cell text-center">Registrado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{company.location}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(company.status)}</TableCell>
                  <TableCell className="hidden md:table-cell text-center text-xs text-muted-foreground">
                    {format(new Date(company.registrationDate), "P")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="hover:text-blue-500" title="Ver detalles" onClick={() => handleView(company)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:text-primary" title="Editar" onClick={() => handleEdit(company)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:text-destructive" title="Eliminar" onClick={() => handleDelete(company)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Ver empresa */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la empresa</DialogTitle>
            <DialogDescription>
              {selectedCompany && (
                <div className="space-y-2">
                  <div><b>Nombre:</b> {selectedCompany.name}</div>
                  <div><b>Ubicación:</b> {selectedCompany.location}</div>
                  <div><b>Estado:</b> {statusTranslations[selectedCompany.status]}</div>
                  <div><b>Registrado:</b> {format(new Date(selectedCompany.registrationDate), "P")}</div>
                  {/* Aquí puedes agregar más campos relevantes */}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setViewModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar empresa */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar empresa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Nombre</label>
            <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
            <label className="block text-sm font-medium">Ubicación</label>
            <input name="location" value={editForm.location} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
            <label className="block text-sm font-medium">Estado</label>
            <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
              <option value="active">{statusTranslations.active}</option>
              <option value="inactive">{statusTranslations.inactive}</option>
              <option value="pending">{statusTranslations.pending}</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleEditSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar empresa */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar empresa</DialogTitle>
            <DialogDescription>¿Estás seguro de que deseas eliminar esta empresa?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={confirmDelete} variant="destructive" disabled={loading}>{loading ? 'Eliminando...' : 'Eliminar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback modal */}
      <Dialog open={!!feedback} onOpenChange={() => setFeedback(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{feedback?.type === 'success' ? 'Éxito' : 'Error'}</DialogTitle>
            <DialogDescription>{feedback?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setFeedback(null)}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
