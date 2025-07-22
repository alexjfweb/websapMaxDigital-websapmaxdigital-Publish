"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gem, CreditCard, QrCode, History, Save, CheckCircle, UploadCloud, Trash2, Edit2, Plus, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';


// Mock Data
const subscriptionPlans = [
  {
    id: "basic",
    name: "Plan Básico",
    price: 10,
    features: [
      "Hasta 50 productos",
      "Soporte por email",
      "Estadísticas básicas",
      "1 usuario administrador"
    ]
  },
  {
    id: "pro",
    name: "Plan Pro",
    price: 25,
    features: [
      "Hasta 500 productos",
      "Soporte prioritario",
      "Estadísticas avanzadas",
      "5 usuarios administradores"
    ]
  },
  {
    id: "enterprise",
    name: "Plan Empresarial",
    price: 50,
    features: [
      "Productos ilimitados",
      "Soporte 24/7",
      "Estadísticas premium",
      "Usuarios ilimitados"
    ]
  }
];

const mockTransactions = [
  { id: "txn_1", company: "The Burger Joint", plan: "Pro", amount: 25.00, date: "2024-07-31T10:00:00Z", status: "Completed" },
  { id: "txn_2", company: "Pizza Palace", plan: "Basic", amount: 10.00, date: "2024-07-30T11:00:00Z", status: "Completed" },
  { id: "txn_3", company: "Sushi Central", plan: "Pro", amount: 25.00, date: "2024-07-29T12:00:00Z", status: "Failed" },
];

export default function SuperAdminSubscriptionsPage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [bancolombiaQrPreview, setBancolombiaQrPreview] = useState<string | null>(null);
  const [plans, setPlans] = useState([
    {
      id: "basic",
      name: "Plan Básico",
      price: 10,
      features: [
        "Hasta 50 productos",
        "Soporte por email",
        "Estadísticas básicas",
        "1 usuario administrador"
      ]
    },
    {
      id: "pro",
      name: "Plan Pro",
      price: 25,
      features: [
        "Hasta 500 productos",
        "Soporte prioritario",
        "Estadísticas avanzadas",
        "5 usuarios administradores"
      ]
    },
    {
      id: "enterprise",
      name: "Plan Empresarial",
      price: 50,
      features: [
        "Productos ilimitados",
        "Soporte 24/7",
        "Estadísticas premium",
        "Usuarios ilimitados"
      ]
    }
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    id: '',
    name: '',
    price: '',
    features: ['']
  });
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const [successModal, setSuccessModal] = useState({ open: false, message: '' });

  // Métodos de pago dinámicos
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'stripe', name: 'Stripe', type: 'tarjeta', fields: [{ label: 'Clave pública', value: '' }, { label: 'Clave secreta', value: '' }] },
    { id: 'mercadopago', name: 'Mercado Pago', type: 'tarjeta', fields: [{ label: 'Token de acceso', value: '' }] },
    { id: 'nequi', name: 'Nequi', type: 'transferencia', fields: [{ label: 'Número de teléfono', value: '' }] },
    { id: 'bancolombia', name: 'BanColombia', type: 'qr', fields: [{ label: 'URL del código QR', value: '' }] },
  ]);
  const [pmModalOpen, setPmModalOpen] = useState(false);
  const [pmDeleteModalOpen, setPmDeleteModalOpen] = useState(false);
  const [selectedPm, setSelectedPm] = useState(null);
  const [pmForm, setPmForm] = useState({ id: '', name: '', type: '', fields: [{ label: '', value: '' }] });
  const [isPmEdit, setIsPmEdit] = useState(false);
  const [pmErrorModal, setPmErrorModal] = useState({ open: false, message: '' });
  const [pmSuccessModal, setPmSuccessModal] = useState({ open: false, message: '' });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleQrUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic validation for URL format
    if (e.target.value && (e.target.value.startsWith('http://') || e.target.value.startsWith('https://'))) {
        setBancolombiaQrPreview(e.target.value);
    } else if (!e.target.value) {
        setBancolombiaQrPreview(null);
    }
  };

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setBancolombiaQrPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else if (file) {
        toast({
            title: "Invalid File Type",
            description: "Please select a valid image file (PNG, JPG, SVG).",
            variant: "destructive"
        })
    }
  };

  const handleOpenCreate = () => {
    setForm({ id: '', name: '', price: '', features: [''] });
    setIsEdit(false);
    setModalOpen(true);
  };
  const handleOpenEdit = (plan) => {
    setForm({
      id: plan.id,
      name: plan.name,
      price: plan.price.toString(),
      features: [...plan.features]
    });
    setIsEdit(true);
    setModalOpen(true);
  };
  const handleOpenDetails = (plan) => {
    setSelectedPlan(plan);
    setIsEdit(false);
    setModalOpen(true);
  };
  const handleOpenDelete = (plan) => {
    setSelectedPlan(plan);
    setDeleteModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPlan(null);
  };
  const handleCloseDelete = () => {
    setDeleteModalOpen(false);
    setSelectedPlan(null);
  };
  const handleSave = () => {
    // Validaciones
    if (!form.name.trim()) {
      setErrorModal({ open: true, message: 'El nombre del plan es obligatorio.' });
      return;
    }
    if (form.name.length < 3 || form.name.length > 30) {
      setErrorModal({ open: true, message: 'El nombre debe tener entre 3 y 30 caracteres.' });
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      setErrorModal({ open: true, message: 'El precio debe ser un número positivo.' });
      return;
    }
    if (form.features.length === 0 || form.features.some(f => !f.trim())) {
      setErrorModal({ open: true, message: 'Debes agregar al menos una característica y no pueden estar vacías.' });
      return;
    }
    // Validar nombre único
    const nameExists = plans.some(p => p.name.toLowerCase() === form.name.trim().toLowerCase() && (!isEdit || p.id !== form.id));
    if (nameExists) {
      setErrorModal({ open: true, message: 'Ya existe un plan con ese nombre.' });
      return;
    }
    if (isEdit) {
      setPlans(plans.map(p => p.id === form.id ? {
        ...form,
        price: parseFloat(form.price),
        features: form.features.filter(f => f.trim() !== '')
      } : p));
      setSuccessModal({ open: true, message: '¡Plan actualizado correctamente!' });
    } else {
      setPlans([
        ...plans,
        {
          ...form,
          id: form.name.toLowerCase().replace(/ /g, '-'),
          price: parseFloat(form.price),
          features: form.features.filter(f => f.trim() !== '')
        }
      ]);
      setSuccessModal({ open: true, message: '¡Plan creado correctamente!' });
    }
    setModalOpen(false);
    setSelectedPlan(null);
  };
  const handleDelete = () => {
    setPlans(plans.filter(p => p.id !== selectedPlan.id));
    setDeleteModalOpen(false);
    setSelectedPlan(null);
    setSuccessModal({ open: true, message: '¡Plan eliminado correctamente!' });
  };
  const handleFormChange = (e, idx = null) => {
    const { name, value } = e.target;
    if (name === 'features' && idx !== null) {
      const newFeatures = [...form.features];
      newFeatures[idx] = value;
      setForm({ ...form, features: newFeatures });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const handleAddFeature = () => setForm({ ...form, features: [...form.features, ''] });
  const handleRemoveFeature = (idx) => setForm({ ...form, features: form.features.filter((_, i) => i !== idx) });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return <Badge className="bg-green-500 text-white hover:bg-green-600">Completado</Badge>;
      case "Failed": return <Badge variant="destructive">Fallido</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenPmCreate = () => {
    setPmForm({ id: '', name: '', type: '', fields: [{ label: '', value: '' }] });
    setIsPmEdit(false);
    setPmModalOpen(true);
  };
  const handleOpenPmEdit = (pm) => {
    setPmForm({ ...pm, fields: pm.fields.map(f => ({ ...f })) });
    setIsPmEdit(true);
    setPmModalOpen(true);
  };
  const handleOpenPmDelete = (pm) => {
    setSelectedPm(pm);
    setPmDeleteModalOpen(true);
  };
  const handleClosePmModal = () => {
    setPmModalOpen(false);
    setSelectedPm(null);
  };
  const handleClosePmDelete = () => {
    setPmDeleteModalOpen(false);
    setSelectedPm(null);
  };
  const handlePmFormChange = (e, idx = null) => {
    const { name, value } = e.target;
    if (name === 'fields' && idx !== null) {
      const newFields = [...pmForm.fields];
      newFields[idx].value = value;
      setPmForm({ ...pmForm, fields: newFields });
    } else {
      setPmForm({ ...pmForm, [name]: value });
    }
  };
  const handlePmFieldLabelChange = (e, idx) => {
    const newFields = [...pmForm.fields];
    newFields[idx].label = e.target.value;
    setPmForm({ ...pmForm, fields: newFields });
  };
  const handleAddPmField = () => setPmForm({ ...pmForm, fields: [...pmForm.fields, { label: '', value: '' }] });
  const handleRemovePmField = (idx) => setPmForm({ ...pmForm, fields: pmForm.fields.filter((_, i) => i !== idx) });
  const handlePmSave = () => {
    if (!pmForm.name.trim()) {
      setPmErrorModal({ open: true, message: 'El nombre del método de pago es obligatorio.' });
      return;
    }
    if (!pmForm.type.trim()) {
      setPmErrorModal({ open: true, message: 'El tipo de método de pago es obligatorio.' });
      return;
    }
    if (pmForm.fields.length === 0 || pmForm.fields.some(f => !f.label.trim())) {
      setPmErrorModal({ open: true, message: 'Debes agregar al menos un campo y todos deben tener nombre.' });
      return;
    }
    const nameExists = paymentMethods.some(pm => pm.name.toLowerCase() === pmForm.name.trim().toLowerCase() && (!isPmEdit || pm.id !== pmForm.id));
    if (nameExists) {
      setPmErrorModal({ open: true, message: 'Ya existe un método de pago con ese nombre.' });
      return;
    }
    if (isPmEdit) {
      setPaymentMethods(paymentMethods.map(pm => pm.id === pmForm.id ? { ...pmForm, id: pmForm.name.toLowerCase().replace(/ /g, '-') } : pm));
      setPmSuccessModal({ open: true, message: '¡Método de pago actualizado correctamente!' });
    } else {
      setPaymentMethods([
        ...paymentMethods,
        { ...pmForm, id: pmForm.name.toLowerCase().replace(/ /g, '-') }
      ]);
      setPmSuccessModal({ open: true, message: '¡Método de pago creado correctamente!' });
    }
    setPmModalOpen(false);
    setSelectedPm(null);
  };
  const handlePmDelete = () => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== selectedPm.id));
    setPmDeleteModalOpen(false);
    setSelectedPm(null);
    setPmSuccessModal({ open: true, message: '¡Método de pago eliminado correctamente!' });
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Suscripciones</h1>
        <p className="text-lg text-muted-foreground">Descripción de la página de suscripciones</p>
      </div>

      {/* Subscription Plans Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2"><Gem className="h-5 w-5" /> Título de la sección de planes</CardTitle>
          <Button variant="outline" size="sm" onClick={handleOpenCreate}><Plus className="h-4 w-4 mr-1" /> Nuevo plan</Button>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          {plans.map(plan => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-2xl font-bold text-primary">${plan.price} USD/mes</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleOpenDetails(plan)}>
                  Ver detalles
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleOpenEdit(plan)}>
                  <Edit2 className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleOpenDelete(plan)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Payment Methods Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Título de la sección de métodos de pago</CardTitle>
          <Button variant="outline" size="sm" onClick={handleOpenPmCreate}><Plus className="h-4 w-4 mr-1" /> Nuevo método</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentMethods.map((pm, idx) => (
            <div key={pm.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">{pm.name}</Label>
                <span className="text-xs text-muted-foreground">{pm.type}</span>
                <Button variant="outline" size="icon" onClick={() => handleOpenPmEdit(pm)}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleOpenPmDelete(pm)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              {pm.fields.map((field, fidx) => (
                <div key={fidx} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Input value={field.value} readOnly disabled />
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* QR Code Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" /> Título de la sección de códigos QR</CardTitle>
          <CardDescription>Descripción de la sección de códigos QR</CardDescription>
        </CardHeader>
        <CardContent>
            <Button>Generar QR</Button>
             {/* TODO: List of generated QRs here */}
        </CardContent>
      </Card>
      
      {/* Transaction History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Título de la sección de historial de transacciones</CardTitle>
          <CardDescription>Descripción de la sección de historial de transacciones</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de la empresa</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.company}</TableCell>
                  <TableCell>{tx.plan}</TableCell>
                  <TableCell className="text-right">${tx.amount.toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{format(new Date(tx.date), "PPp")}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(tx.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar plan' : selectedPlan ? 'Detalles del plan' : 'Nuevo plan'}</DialogTitle>
            <DialogDescription>
              {isEdit || !selectedPlan ? (
                <div>
                  <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <div>
                      <Label>Nombre del plan</Label>
                      <Input name="name" value={form.name} onChange={handleFormChange} required />
                    </div>
                    <div>
                      <Label>Precio (USD/mes)</Label>
                      <Input name="price" type="number" min="0" value={form.price} onChange={handleFormChange} required />
                    </div>
                    <div>
                      <Label>Características</Label>
                      {form.features.map((feature, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input name="features" value={feature} onChange={e => handleFormChange(e, idx)} required />
                          {form.features.length > 1 && (
                            <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveFeature(idx)}><Trash2 className="h-4 w-4" /></Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={handleAddFeature}>Agregar característica</Button>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{isEdit ? 'Actualizar' : 'Crear'}</Button>
                      <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                    </DialogFooter>
                  </form>
                </div>
              ) : (
                <>
                  <div className="text-lg font-bold mb-2">{selectedPlan.name}</div>
                  <div className="text-primary text-xl font-bold mb-2">${selectedPlan.price} USD/mes</div>
                  <ul className="space-y-1 text-sm text-muted-foreground mb-2">
                    {selectedPlan.features.map((feature, idx) => (
                      <li key={idx}>- {feature}</li>
                    ))}
                  </ul>
                  <DialogFooter>
                    <Button onClick={handleCloseModal}>Cerrar</Button>
                  </DialogFooter>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar plan</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el plan "{selectedPlan?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
            <Button variant="outline" onClick={handleCloseDelete}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={errorModal.open} onOpenChange={open => setErrorModal({ ...errorModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" /> Error</DialogTitle>
            <DialogDescription>{errorModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setErrorModal({ open: false, message: '' })}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={successModal.open} onOpenChange={open => setSuccessModal({ ...successModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /> Éxito</DialogTitle>
            <DialogDescription>{successModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuccessModal({ open: false, message: '' })}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Crear/Editar método de pago */}
      <Dialog open={pmModalOpen} onOpenChange={setPmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isPmEdit ? 'Editar método de pago' : 'Nuevo método de pago'}</DialogTitle>
            <DialogDescription>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); handlePmSave(); }}>
                <div>
                  <Label>Nombre</Label>
                  <Input name="name" value={pmForm.name} onChange={handlePmFormChange} required />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Input name="type" value={pmForm.type} onChange={handlePmFormChange} required />
                </div>
                <div>
                  <Label>Campos configurables</Label>
                  {pmForm.fields.map((field, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <Input name="fieldLabel" value={field.label} onChange={e => handlePmFieldLabelChange(e, idx)} placeholder="Nombre del campo" required />
                      <Input name="fields" value={field.value} onChange={e => handlePmFormChange(e, idx)} placeholder="Valor" />
                      {pmForm.fields.length > 1 && (
                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemovePmField(idx)}><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={handleAddPmField}>Agregar campo</Button>
                </div>
                <DialogFooter>
                  <Button type="submit">{isPmEdit ? 'Actualizar' : 'Crear'}</Button>
                  <Button type="button" variant="outline" onClick={handleClosePmModal}>Cancelar</Button>
                </DialogFooter>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminación método de pago */}
      <Dialog open={pmDeleteModalOpen} onOpenChange={setPmDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar método de pago</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el método de pago "{selectedPm?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handlePmDelete}>Eliminar</Button>
            <Button variant="outline" onClick={handleClosePmDelete}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de error y éxito para métodos de pago */}
      <Dialog open={pmErrorModal.open} onOpenChange={open => setPmErrorModal({ ...pmErrorModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" /> Error</DialogTitle>
            <DialogDescription>{pmErrorModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPmErrorModal({ open: false, message: '' })}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={pmSuccessModal.open} onOpenChange={open => setPmSuccessModal({ ...pmSuccessModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /> Éxito</DialogTitle>
            <DialogDescription>{pmSuccessModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPmSuccessModal({ open: false, message: '' })}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
