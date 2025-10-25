
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Filter, Eye, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Company } from "@/types";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useCompanies } from "@/hooks/use-companies";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateCompanyInput, companyService } from "@/services/company-service";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


export default function SuperAdminCompaniesPage() {
  const { companies, isLoading, error, refreshCompanies } = useCompanies();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { toast } = useToast();

  // States for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cancelSubModalOpen, setCancelSubModalOpen] = useState(false);
  
  const initialFormState: CreateCompanyInput = {
    name: '', ruc: '', location: '', email: '', phone: '', phoneFixed: '',
    addressStreet: '', addressNeighborhood: '', addressState: '', addressPostalCode: '',
    companyType: ''
  };

  // States for forms and feedback
  const [newCompanyForm, setNewCompanyForm] = useState<CreateCompanyInput>(initialFormState);
  const [editForm, setEditForm] = useState<Partial<Company>>({});
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
      (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.phone && company.phone.includes(searchTerm)) ||
      (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && searchMatch;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompanyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateNew = async () => {
    if (!newCompanyForm.name || !newCompanyForm.ruc) {
      setFeedback({ type: 'error', message: 'El nombre y el RUC son obligatorios.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
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
      setNewCompanyForm(initialFormState); // Reset form
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
    setEditForm(company);
    setEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!selectedCompany?.id) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
        const response = await fetch(`/api/companies/${selectedCompany.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Error al actualizar la empresa');
        }
        setFeedback({ type: 'success', message: 'Empresa actualizada exitosamente.' });
        setEditModalOpen(false);
        await refreshCompanies();
    } catch (err: any) {
        setFeedback({ type: 'error', message: err.message });
    } finally {
        setIsSubmitting(false);
    }
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
  
  const handleCancelSubscription = (company: Company) => {
    setSelectedCompany(company);
    setCancelSubModalOpen(true);
  };

  const confirmCancelSubscription = async () => {
    if (!selectedCompany?.id) return;
    setIsSubmitting(true);
    try {
        const response = await fetch('/api/payments/cancel-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId: selectedCompany.id }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'No se pudo cancelar la suscripción.');
        }
        toast({ title: "Suscripción Cancelada", description: `La suscripción de ${selectedCompany.name} ha sido cancelada.`});
        await refreshCompanies();
    } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
        setCancelSubModalOpen(false);
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell className="hidden md:table-cell text-center"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center text-red-500">
            Error al cargar las empresas. Por favor, intente de nuevo más tarde.
          </TableCell>
        </TableRow>
      );
    }

    if (filteredCompanies.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center text-muted-foreground">
            No se encontraron empresas que coincidan con los filtros.
          </TableCell>
        </TableRow>
      );
    }

    return filteredCompanies.map((company) => (
      <TableRow key={company.id}>
        <TableCell className="font-medium">{company.name}</TableCell>
        <TableCell>{company.ruc}</TableCell>
        <TableCell className="hidden sm:table-cell">{company.email || 'N/A'}</TableCell>
        <TableCell className="text-center">{getStatusBadge(company.status)}</TableCell>
        <TableCell><Badge variant="outline">{company.planName}</Badge></TableCell>
        <TableCell className="hidden md:table-cell text-center text-xs text-muted-foreground">
          {company.registrationDate ? format(new Date(company.registrationDate), "P") : 'N/A'}
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:text-primary" title="Acciones">
                <span className="sr-only">Acciones</span>
                <Edit3 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(company)}>
                <Eye className="mr-2 h-4 w-4" />Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(company)}>
                <Edit3 className="mr-2 h-4 w-4" />Editar Empresa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(company)}>
                <Trash2 className="mr-2 h-4 w-4" />Eliminar (Desactivar)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleCancelSubscription(company)} 
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                disabled={company.subscriptionStatus !== 'active' || !company.mpPreapprovalId}
              >
                <XCircle className="mr-2 h-4 w-4" />Cancelar Suscripción
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Empresa</DialogTitle>
              <DialogDescription>
                Complete los siguientes campos para registrar una nueva empresa.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Nombre de la Empresa *</label>
                  <Input name="name" value={newCompanyForm.name} onChange={handleInputChange} placeholder="Ej. Restaurante S.A.S" />
                </div>
                <div>
                  <label className="block text-sm font-medium">RUC / ID Fiscal *</label>
                  <Input name="ruc" value={newCompanyForm.ruc} onChange={handleInputChange} placeholder="Ej. 123456789-0" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Email de Contacto</label>
                  <Input name="email" type="email" value={newCompanyForm.email} onChange={handleInputChange} placeholder="contacto@empresa.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tipo de Empresa</label>
                  <Input name="companyType" value={newCompanyForm.companyType} onChange={handleInputChange} placeholder="Ej. SAS, Ltda." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Teléfono Fijo</label>
                  <Input name="phoneFixed" value={newCompanyForm.phoneFixed} onChange={handleInputChange} placeholder="Ej. (1) 2345678" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Teléfono Móvil (WhatsApp)</label>
                  <Input name="phone" value={newCompanyForm.phone} onChange={handleInputChange} placeholder="Ej. 3001234567" />
                </div>
              </div>
              <hr className="my-4"/>
              <h3 className="text-lg font-semibold">Dirección Detallada</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Calle y Número</label>
                  <Input name="addressStreet" value={newCompanyForm.addressStreet} onChange={handleInputChange} placeholder="Ej. Calle 100 # 19-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Barrio / Colonia</label>
                  <Input name="addressNeighborhood" value={newCompanyForm.addressNeighborhood} onChange={handleInputChange} placeholder="Ej. Chapinero" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">Ciudad</label>
                  <Input name="location" value={newCompanyForm.location} onChange={handleInputChange} placeholder="Ej. Bogotá" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Departamento / Estado</label>
                  <Input name="addressState" value={newCompanyForm.addressState} onChange={handleInputChange} placeholder="Ej. Cundinamarca" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Código Postal</label>
                  <Input name="addressPostalCode" value={newCompanyForm.addressPostalCode} onChange={handleInputChange} placeholder="Ej. 110221" />
                </div>
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
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead>Plan</TableHead>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la empresa</DialogTitle>
          </DialogHeader>
            {selectedCompany && (
              <div className="space-y-3 mt-4 text-sm max-h-[70vh] overflow-y-auto">
                <p><strong>Nombre:</strong> {selectedCompany.name}</p>
                <p><strong>RUC:</strong> {selectedCompany.ruc}</p>
                <p><strong>Tipo:</strong> {selectedCompany.companyType || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedCompany.email || 'N/A'}</p>
                <p><strong>Teléfono Fijo:</strong> {selectedCompany.phoneFixed || 'N/A'}</p>
                <p><strong>Teléfono Móvil:</strong> {selectedCompany.phone || 'N/A'}</p>
                <p><strong>Dirección:</strong> {`${selectedCompany.addressStreet || ''}, ${selectedCompany.addressNeighborhood || ''}, ${selectedCompany.location}, ${selectedCompany.addressState || ''}, ${selectedCompany.addressPostalCode || ''}`}</p>
                <p><strong>Estado:</strong> {statusTranslations[selectedCompany.status]}</p>
                <p><strong>Plan:</strong> {(selectedCompany as any).planName || 'N/A'}</p>
                <p><strong>Registrado:</strong> {selectedCompany.registrationDate ? format(new Date(selectedCompany.registrationDate), "P") : 'N/A'}</p>
              </div>
            )}
          <DialogFooter>
            <Button onClick={() => setViewModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar empresa */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
             <DialogDescription>
                Actualice los datos de la empresa.
              </DialogDescription>
          </DialogHeader>
           <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Nombre *</label>
                  <Input name="name" value={editForm.name || ''} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium">RUC *</label>
                  <Input name="ruc" value={editForm.ruc || ''} onChange={handleEditChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <Input name="email" type="email" value={editForm.email || ''} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tipo de Empresa</label>
                  <Input name="companyType" value={editForm.companyType || ''} onChange={handleEditChange} />
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Teléfono Fijo</label>
                  <Input name="phoneFixed" value={editForm.phoneFixed || ''} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Móvil (WhatsApp)</label>
                  <Input name="phone" value={editForm.phone || ''} onChange={handleEditChange} />
                </div>
              </div>
              <hr className="my-4"/>
              <h3 className="text-lg font-semibold">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Calle y Número</label>
                  <Input name="addressStreet" value={editForm.addressStreet || ''} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Barrio</label>
                  <Input name="addressNeighborhood" value={editForm.addressNeighborhood || ''} onChange={handleEditChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">Ciudad</label>
                  <Input name="location" value={editForm.location || ''} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Estado</label>
                  <Input name="addressState" value={editForm.addressState || ''} onChange={handleEditChange} />
                </div>
                 <div>
                  <label className="block text-sm font-medium">Código Postal</label>
                  <Input name="addressPostalCode" value={editForm.addressPostalCode || ''} onChange={handleEditChange} />
                </div>
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
            <Button onClick={handleEditSave} disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</Button>
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
      
      {/* Modal Cancelar Suscripción */}
      <AlertDialog open={cancelSubModalOpen} onOpenChange={setCancelSubModalOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Confirmas la cancelación?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción cancelará la suscripción de <strong>{selectedCompany?.name}</strong> de forma inmediata. La acción no se puede deshacer.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCancelSubModalOpen(false)} disabled={isSubmitting}>Volver</AlertDialogCancel>
                <AlertDialogAction onClick={confirmCancelSubscription} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Cancelando...' : 'Sí, cancelar suscripción'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

