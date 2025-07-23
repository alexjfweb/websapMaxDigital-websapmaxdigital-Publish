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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useCompanies } from "@/hooks/use-companies";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAdminCompaniesPage() {
  const { companies, isLoading, error, refreshCompanies } = useCompanies();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // States for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // States for forms and feedback
  const [newCompanyForm, setNewCompanyForm] = useState({ name: '', ruc: '', location: '' });
  const [editForm, setEditForm] = useState<{ name: string; location: string; status: string; ruc: string }>({ name: '', location: '', status: 'active', ruc: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (companies.length > 0) {
      console.log('🟢 Empresas recibidas en el componente:', companies);
    }
    if (error) {
      console.error('🔴 Error al cargar empresas:', error);
    }
  }, [companies, error]);

  const statusTranslations: { [key in Company['status'] | 'all']: string } = {
    all: "Todos",
    active: "Activo",
    inactive: "Inactivo",
    pending: "Pendiente"
  };

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

  const filteredCompanies = companies.filter(company => {
    const statusMatch = statusFilter === "all" || company.status === statusFilter;
    const searchMatch =
      !searchTerm ||
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.ruc.includes(searchTerm) ||
      (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && searchMatch;
  });

  const handleCreateNew = async () => {
    if (!newCompanyForm.name || !newCompanyForm.ruc) {
      setFeedback({ type: 'error', message: 'El nombre y el RUC son obligatorios.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompanyForm),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la empresa');
      }
      setFeedback({ type: 'success', message: 'Empresa creada exitosamente.' });
      setIsCreateModalOpen(false);
      setNewCompanyForm({ name: '', ruc: '', location: '' }); // Reset form
      await refreshCompanies(); // Refresh the list
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setViewModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setEditForm({ name: company.name, location: company.location || '', status: company.status, ruc: company.ruc });
    setEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    // Aquí iría la lógica para llamar al servicio de actualización
    console.log("Guardando cambios para:", selectedCompany?.id, editForm);
    setEditModalOpen(false);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    // Aquí iría la lógica para llamar al servicio de eliminación
    console.log("Eliminando empresa:", selectedCompany?.id);
    setDeleteModalOpen(false);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell className="hidden md:table-cell text-center"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-red-500">
            Error al cargar las empresas. Por favor, intente de nuevo más tarde.
          </TableCell>
        </TableRow>
      );
    }

    if (filteredCompanies.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-muted-foreground">
            No se encontraron empresas que coincidan con los filtros.
          </TableCell>
        </TableRow>
      );
    }

    return filteredCompanies.map((company) => (
      <TableRow key={company.id}>
        <TableCell className="font-medium">{company.name}</TableCell>
        <TableCell>{company.ruc}</TableCell>
        <TableCell className="hidden sm:table-cell">{company.location}</TableCell>
        <TableCell className="text-center">{getStatusBadge(company.status)}</TableCell>
        <TableCell className="hidden md:table-cell text-center text-xs text-muted-foreground">
          {company.registrationDate ? format(new Date(company.registrationDate), "P") : 'N/A'}
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
    ));
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Empresas</h1>
          <p className="text-lg text-muted-foreground">Descripción de la página de empresas</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" /> Registrar nueva empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Empresa</DialogTitle>
              <DialogDescription>
                Complete los siguientes campos para registrar una nueva empresa.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <Input value={newCompanyForm.name} onChange={e => setNewCompanyForm({...newCompanyForm, name: e.target.value})} placeholder="Ej. Restaurante S.A." />
              </div>
              <div>
                <label className="block text-sm font-medium">RUC</label>
                <Input value={newCompanyForm.ruc} onChange={e => setNewCompanyForm({...newCompanyForm, ruc: e.target.value})} placeholder="Ej. 123456789" />
              </div>
              <div>
                <label className="block text-sm font-medium">Ubicación</label>
                <Input value={newCompanyForm.location} onChange={e => setNewCompanyForm({...newCompanyForm, location: e.target.value})} placeholder="Ej. Ciudad, País" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button onClick={handleCreateNew} disabled={isSubmitting}>{isSubmitting ? 'Registrando...' : 'Registrar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las empresas</CardTitle>
          <CardDescription>Descripción de la sección de todas las empresas</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, RUC o ubicación..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                <TableHead>RUC</TableHead>
                <TableHead className="hidden sm:table-cell">Ubicación</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="hidden md:table-cell text-center">Registrado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableContent()}
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
                <div className="space-y-2 mt-4">
                  <div><b>Nombre:</b> {selectedCompany.name}</div>
                  <div><b>RUC:</b> {selectedCompany.ruc}</div>
                  <div><b>Ubicación:</b> {selectedCompany.location}</div>
                  <div><b>Estado:</b> {statusTranslations[selectedCompany.status]}</div>
                  <div><b>Registrado:</b> {selectedCompany.registrationDate ? format(new Date(selectedCompany.registrationDate), "P") : 'N/A'}</div>
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
          <div className="space-y-4 py-4">
            <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full border rounded px-2 py-1 mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium">RUC</label>
                <input name="ruc" value={editForm.ruc} onChange={handleEditChange} className="w-full border rounded px-2 py-1 mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium">Ubicación</label>
                <input name="location" value={editForm.location} onChange={handleEditChange} className="w-full border rounded px-2 py-1 mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium">Estado</label>
                <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full border rounded px-2 py-1 mt-1">
                  <option value="active">{statusTranslations.active}</option>
                  <option value="inactive">{statusTranslations.inactive}</option>
                  <option value="pending">{statusTranslations.pending}</option>
                </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleEditSave} disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
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
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={confirmDelete} variant="destructive" disabled={isSubmitting}>{isSubmitting ? 'Eliminando...' : 'Eliminar'}</Button>
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
