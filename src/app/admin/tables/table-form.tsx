
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { tableService, type Table, type TableStatus } from "@/services/table-service";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TableFormProps {
  table?: Table | null;
  onSubmit: () => void;
  onCancel: () => void;
  companyId?: string;
}

const initialState = {
  number: '',
  capacity: '',
  location: '',
  description: '',
  status: 'available' as TableStatus,
};

export function TableForm({ table, onSubmit, onCancel, companyId }: TableFormProps) {
  const [form, setForm] = useState({
    number: table?.number?.toString() || '',
    capacity: table?.capacity?.toString() || '',
    location: table?.location || '',
    description: table?.description || '',
    status: table?.status || 'available',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [modal, setModal] = useState<null | { type: 'error' | 'success' | 'warning', title: string, description: string }>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      setModal({ type: 'error', title: 'Error', description: 'ID de la compañía no encontrado.' });
      return;
    }
    // Validaciones básicas
    if (!form.number || isNaN(Number(form.number)) || Number(form.number) <= 0) {
      setModal({ type: 'error', title: 'Error', description: 'El número de mesa es obligatorio y debe ser válido' });
      return;
    }
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) <= 0) {
      setModal({ type: 'error', title: 'Error', description: 'La capacidad es obligatoria y debe ser válida' });
      return;
    }
    setLoading(true);
    try {
      if (table && table.id) {
        await tableService.updateTable(table.id, {
          number: Number(form.number),
          capacity: Number(form.capacity),
          location: form.location,
          description: form.description,
          status: form.status as TableStatus,
        });
        setModal({ type: 'success', title: 'Mesa actualizada', description: 'La mesa se actualizó correctamente' });
      } else {
        await tableService.createTable({
          number: Number(form.number),
          capacity: Number(form.capacity),
          location: form.location,
          description: form.description,
          status: form.status as TableStatus,
          isActive: true,
          restaurantId: companyId,
        });
        setModal({ type: 'success', title: 'Mesa creada', description: 'La mesa se creó correctamente' });
      }
      // onSubmit() se llamará al cerrar el modal de éxito
    } catch (error: any) {
      const msg = error?.message?.includes('Ya existe una mesa con el número')
        ? error.message
        : 'No se pudo guardar la mesa';
      setModal({ type: 'error', title: 'Error', description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="number">Número de mesa</Label>
          <Input
            id="number"
            name="number"
            type="number"
            min={1}
            value={form.number}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="capacity">Capacidad</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            value={form.capacity}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md w-full"
          >
            <option value="available">Disponible</option>
            <option value="occupied">Ocupada</option>
            <option value="reserved">Reservada</option>
            <option value="out_of_service">Fuera de servicio</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : table ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
      {/* MODAL para errores, advertencias y confirmaciones */}
      {modal && modal.type === 'error' && (
        <AlertDialog open onOpenChange={() => setModal(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{modal.title}</AlertDialogTitle>
              <AlertDialogDescription>{modal.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={() => setModal(null)}>Cerrar</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {modal && modal.type === 'success' && (
        <Dialog open onOpenChange={() => { setModal(null); onSubmit(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modal.title}</DialogTitle>
              <DialogDescription>{modal.description}</DialogDescription>
            </DialogHeader>
            <Button onClick={() => { setModal(null); onSubmit(); }}>Aceptar</Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
