
"use client";
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  History,
  ArrowUp, 
  ArrowDown,
  Zap,
  Star,
  DollarSign,
  Users,
  Calendar,
  Palette,
  Check,
  X,
  AlertCircle,
  Gem,
  Activity,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLandingPlans } from '@/hooks/use-landing-plans';
import { landingPlansService } from '@/services/landing-plans-service';
import type { LandingPlan, CreatePlanRequest, PlanAuditLog } from '@/types/plans';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Opciones para íconos y colores
const PLAN_ICONS = [
  { value: 'zap', label: '⚡ Zap', icon: Zap },
  { value: 'star', label: '⭐ Star', icon: Star },
  { value: 'dollar', label: '💰 Dollar', icon: DollarSign },
  { value: 'users', label: '👥 Users', icon: Users },
  { value: 'calendar', label: '📅 Calendar', icon: Calendar },
  { value: 'palette', label: '🎨 Palette', icon: Palette },
];

const PLAN_COLORS = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'purple', label: 'Púrpura', class: 'bg-purple-500' },
  { value: 'orange', label: 'Naranja', class: 'bg-orange-500' },
  { value: 'red', label: 'Rojo', class: 'bg-red-500' },
  { value: 'indigo', label: 'Índigo', class: 'bg-indigo-500' },
];

const PERIODS = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
  { value: 'lifetime', label: 'De por vida' },
];

function PlanHistoryDialog({ planId }: { planId: string }) {
  const [logs, setLogs] = useState<PlanAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentUser = { id: 'superadmin', email: 'superadmin@websapmax.com' };

  useEffect(() => {
    if (planId) {
      setIsLoading(true);
      setError(null);
      landingPlansService.getPlanAuditLogs(planId)
        .then(setLogs)
        .catch(err => {
          console.error("Error fetching audit logs:", err);
          setError("No se pudo cargar el historial.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [planId]);

  const { toast } = useToast();

  const handleRollback = async (auditLogId: string) => {
    try {
      await landingPlansService.rollbackPlan(planId, auditLogId, currentUser.id, currentUser.email);
      toast({
        title: "Éxito",
        description: "Plan restaurado a la versión seleccionada."
      });
      // Idealmente, se debería refetchear la lista de planes aquí
    } catch (error: any) {
      toast({
        title: "Error al restaurar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center text-center text-destructive py-8">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="font-semibold">{error}</p>
        </div>
      );
    }
    
    if (logs.length === 0) {
      return (
        <p className="text-gray-500 text-center py-4">No hay historial de cambios para este plan.</p>
      );
    }
    
    return logs.map((log) => (
      <Card key={log.id} className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant={log.action === 'created' ? 'default' : log.action === 'updated' ? 'secondary' : 'destructive'}>
                {log.action}
              </Badge>
              <span className="text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Por: {log.userEmail}
            </p>
            {log.details && Object.keys(log.details).length > 0 && (
              <div className="text-xs text-gray-500 bg-muted p-2 rounded-md">
                <pre className="whitespace-pre-wrap font-mono">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
          {log.previousData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRollback(log.id)}
            >
              Restaurar
            </Button>
          )}
        </div>
      </Card>
    ));
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
      {renderContent()}
    </div>
  );
}


export default function SubscriptionPlansPage() {
  const { plans, isLoading, refetch } = useLandingPlans(false);
  const [isCRUDLoading, setIsCRUDLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LandingPlan | null>(null);
  
  const [selectedPlanForHistory, setSelectedPlanForHistory] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState<Partial<CreatePlanRequest>>({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    period: 'monthly',
    features: [''],
    isActive: true,
    isPopular: false,
    icon: 'zap',
    color: 'blue',
    maxUsers: 5,
    maxProjects: 10,
    ctaText: 'Comenzar Prueba Gratuita'
  });

  const { toast } = useToast();
  
  const displayedPlans = useMemo(() => {
    let sortedPlans = [...plans].sort((a, b) => {
        if (a.order !== b.order) {
            return a.order - b.order;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    if (showInactive) {
      return sortedPlans;
    }
    return sortedPlans.filter(plan => plan.isActive);
  }, [plans, showInactive]);
  
  const stats = useMemo(() => {
    return {
        total: plans.length,
        active: plans.filter(p => p.isActive).length,
        popular: plans.filter(p => p.isPopular).length,
    }
  }, [plans]);

  const currentUser = { id: 'superadmin', email: 'superadmin@websapmax.com' };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(formData.features || []), '']
    }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: 0, currency: 'USD',
      period: 'monthly', features: [''], isActive: true,
      isPopular: false, icon: 'zap', color: 'blue',
      maxUsers: 5, maxProjects: 10, ctaText: 'Comenzar Prueba Gratuita'
    });
  };
  
  const openCreateForm = () => {
    resetForm();
    setEditingPlan(null);
    setIsFormOpen(true);
  };
  
  const openEditForm = (plan: LandingPlan) => {
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      period: plan.period,
      features: plan.features,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      icon: plan.icon,
      color: plan.color,
      maxUsers: plan.maxUsers,
      maxProjects: plan.maxProjects,
      ctaText: plan.ctaText
    });
    setEditingPlan(plan);
    setIsFormOpen(true);
  };
  
  const handleSubmit = async () => {
    setIsCRUDLoading(true);
    try {
      if (!formData.name || !formData.description || !formData.features?.length) {
        toast({ title: "Error", description: "Completa los campos obligatorios", variant: "destructive" });
        return;
      }

      const planData: CreatePlanRequest = {
        name: formData.name,
        description: formData.description,
        price: formData.price || 0,
        currency: formData.currency || 'USD',
        period: formData.period || 'monthly',
        features: formData.features.filter(f => f.trim() !== ''),
        isActive: formData.isActive !== false,
        isPopular: formData.isPopular || false,
        icon: formData.icon || 'zap',
        color: formData.color || 'blue',
        maxUsers: formData.maxUsers,
        maxProjects: formData.maxProjects,
        ctaText: formData.ctaText
      };

      if (editingPlan) {
        await landingPlansService.updatePlan(editingPlan.id, planData, currentUser.id, currentUser.email);
        toast({ title: "Éxito", description: "Plan actualizado correctamente" });
      } else {
        await landingPlansService.createPlan(planData, currentUser.id, currentUser.email);
        toast({ title: "Éxito", description: "Plan creado correctamente" });
      }
      
      await refetch();
      setIsFormOpen(false);
      
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsCRUDLoading(false);
    }
  };

  const handleDelete = async (plan: LandingPlan) => {
    setIsCRUDLoading(true);
    try {
      await landingPlansService.deletePlan(plan.id, currentUser.id, currentUser.email);
      await refetch();
      toast({ title: "Éxito", description: "Plan eliminado correctamente" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsCRUDLoading(false);
    }
  };

  const handleReorder = async (planId: string, direction: 'up' | 'down') => {
    const currentIndex = plans.findIndex(p => p.id === planId);
    if (currentIndex === -1) return;

    const newPlans = [...plans];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newPlans.length) {
        [newPlans[currentIndex], newPlans[targetIndex]] = [newPlans[targetIndex], newPlans[currentIndex]];
    }

    setIsCRUDLoading(true);
    try {
      await landingPlansService.reorderPlans(newPlans.map(p => p.id), currentUser.id, currentUser.email);
      await refetch();
      toast({ title: "Éxito", description: "Orden actualizado" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsCRUDLoading(false);
    }
  };


  const getIconComponent = (iconValue: string) => {
    const iconData = PLAN_ICONS.find(icon => icon.value === iconValue);
    return iconData ? iconData.icon : Zap;
  };

  const getColorClass = (colorValue: string) => {
    const colorData = PLAN_COLORS.find(color => color.value === colorValue);
    return colorData ? colorData.class : 'bg-blue-500';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Cargando planes...</div>
          <Skeleton className="h-8 w-8 mx-auto animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Planes de Suscripción</h1>
          <p className="text-gray-600 mt-2">
            Administra los planes que se muestran en la página principal
          </p>
        </div>
        <Button onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Crear Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Planes</CardTitle>
                <Gem className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.active}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planes Populares</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.popular}</div></CardContent>
        </Card>
         <Card className="col-span-1 md:col-span-3">
            <CardContent className="p-4 flex items-center justify-center h-full">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="show-inactive"
                        checked={showInactive}
                        onCheckedChange={setShowInactive}
                    />
                    <Label htmlFor="show-inactive" className="text-sm text-gray-600">
                        Mostrar planes inactivos
                    </Label>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {displayedPlans.map((plan, index) => {
            const IconComponent = getIconComponent(plan.icon);
            const colorClass = getColorClass(plan.color);
            
            return (
              <motion.div
                key={plan.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`hover:shadow-md transition-shadow ${!plan.isActive ? 'bg-gray-100 opacity-70' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white`}>
                          <IconComponent size={24} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-semibold">{plan.name}</h3>
                            {plan.isPopular && <Badge className="bg-yellow-400 text-yellow-900">Popular</Badge>}
                            {!plan.isActive && <Badge variant="secondary">Inactivo</Badge>}
                          </div>
                          <p className="text-gray-600">{plan.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>${plan.price}/{plan.period}</span>
                            <span>Orden: {plan.order}</span>
                            <span>{plan.features.length} características</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleReorder(plan.id, 'up')} disabled={index === 0}><ArrowUp className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleReorder(plan.id, 'down')} disabled={index === displayedPlans.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                        <Dialog onOpenChange={(open) => !open && setSelectedPlanForHistory(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPlanForHistory(plan.id)}><History className="w-4 h-4" /></Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>Historial - {plan.name}</DialogTitle></DialogHeader>{selectedPlanForHistory === plan.id && <PlanHistoryDialog planId={plan.id} />}</DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => openEditForm(plan)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>¿Eliminar este plan?</AlertDialogTitle><AlertDialogDescription>Esta acción marcará el plan como inactivo. No se eliminará permanentemente.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(plan)} className="bg-destructive hover:bg-destructive/90">Sí, eliminar</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="name">Nombre *</Label><Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} /></div>
              <div><Label htmlFor="price">Precio *</Label><Input id="price" type="number" value={formData.price} onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} /></div>
            </div>
            <div><Label htmlFor="description">Descripción *</Label><Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3}/></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label htmlFor="currency">Moneda</Label><Select value={formData.currency} onValueChange={(v) => handleInputChange('currency', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="COP">COP</SelectItem></SelectContent></Select></div>
              <div><Label htmlFor="period">Período</Label><Select value={formData.period} onValueChange={(v) => handleInputChange('period', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{PERIODS.map(p=><SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="ctaText">Texto del Botón</Label><Input id="ctaText" value={formData.ctaText} onChange={(e) => handleInputChange('ctaText', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="icon">Ícono</Label><Select value={formData.icon} onValueChange={(v) => handleInputChange('icon', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{PLAN_ICONS.map(i=><SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="color">Color</Label><Select value={formData.color} onValueChange={(v) => handleInputChange('color', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{PLAN_COLORS.map(c=><SelectItem key={c.value} value={c.value}><div className="flex items-center gap-2"><div className={`w-4 h-4 rounded ${c.class}`}></div>{c.label}</div></SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="maxUsers">Límite de Usuarios (-1 = ilimitado)</Label><Input id="maxUsers" type="number" value={formData.maxUsers} onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value) || 0)} /></div>
                <div><Label htmlFor="maxProjects">Límite de Proyectos (-1 = ilimitado)</Label><Input id="maxProjects" type="number" value={formData.maxProjects} onChange={(e) => handleInputChange('maxProjects', parseInt(e.target.value) || 0)} /></div>
            </div>
            <div>
              <Label>Características *</Label>
              <div className="space-y-2">
                {formData.features?.map((feature, index) => (<div key={index} className="flex space-x-2"><Input value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)}/><Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)} disabled={formData.features?.length === 1}><X className="w-4 h-4"/></Button></div>))}
                <Button type="button" variant="outline" onClick={addFeature}><Plus className="w-4 h-4 mr-2"/>Agregar Característica</Button>
              </div>
            </div>
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2"><Switch id="isActive" checked={formData.isActive} onCheckedChange={(c) => handleInputChange('isActive', c)} /><Label htmlFor="isActive">Plan Activo</Label></div>
              <div className="flex items-center space-x-2"><Switch id="isPopular" checked={formData.isPopular} onCheckedChange={(c) => handleInputChange('isPopular', c)} /><Label htmlFor="isPopular">Plan Popular</Label></div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isCRUDLoading}>{isCRUDLoading ? 'Guardando...' : (editingPlan ? 'Actualizar' : 'Crear')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
