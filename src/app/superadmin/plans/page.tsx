"use client";

import React, { useState, useEffect } from 'react';
import { usePlans, usePlansOperations, useCreatePlan, useReorderPlans, plansApi } from '@/hooks/use-plans';
import { Plan, CreatePlanRequest } from '@/types/plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  History, 
  Move, 
  Star,
  Check,
  X,
  DollarSign,
  Users,
  Calendar,
  Palette,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Datos de ejemplo para íconos y colores
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

export default function PlansManagementPage() {
  const { plans, isLoading, error, revalidate } = usePlans();
  const { isLoading: isOperationLoading, error: operationError, executeOperation } = usePlansOperations();
  const { createPlan } = useCreatePlan();
  const { reorderPlans } = useReorderPlans();
  const { toast } = useToast();

  // Estados del formulario
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Datos del formulario
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
    maxUsers: undefined,
    maxProjects: undefined,
  });

  // Mock user data (en producción esto vendría del contexto de autenticación)
  const mockUser = {
    id: 'superadmin-1',
    email: 'admin@websapmax.com',
    role: 'superadmin'
  };

  // Limpiar formulario
  const resetForm = () => {
    setFormData({
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
      maxUsers: undefined,
      maxProjects: undefined,
    });
  };

  // Manejar cambios en el formulario
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Agregar característica
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), '']
    }));
  };

  // Actualizar característica
  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.map((feature, i) => i === index ? value : feature)
    }));
  };

  // Eliminar característica
  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index)
    }));
  };

  // Crear plan
  const handleCreatePlan = async () => {
    if (!formData.name || !formData.description || formData.price === undefined) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const planData: CreatePlanRequest = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      currency: formData.currency || 'USD',
      period: formData.period || 'monthly',
      features: formData.features?.filter(f => f.trim()) || [],
      isActive: formData.isActive ?? true,
      isPopular: formData.isPopular ?? false,
      icon: formData.icon || 'zap',
      color: formData.color || 'blue',
      maxUsers: formData.maxUsers,
      maxProjects: formData.maxProjects,
    };

    const result = await executeOperation(() => createPlan(planData, mockUser));

    if (result) {
      toast({
        title: "Éxito",
        description: `Plan "${planData.name}" creado exitosamente`,
      });
      setIsCreateDialogOpen(false);
      resetForm();
      revalidate();
    } else {
      toast({
        title: "Error",
        description: operationError || "Error al crear el plan",
        variant: "destructive",
      });
    }
  };

  // Eliminar plan
  const handleDeletePlan = async () => {
    if (!deletingPlan) return;

    const result = await executeOperation(() => 
      plansApi.deletePlan(deletingPlan.id, mockUser)
    );

    if (result !== null) {
      toast({
        title: "Éxito",
        description: `Plan "${deletingPlan.name}" eliminado exitosamente`,
      });
      setDeletingPlan(null);
      revalidate();
    } else {
      toast({
        title: "Error",
        description: operationError || "Error al eliminar el plan",
        variant: "destructive",
      });
    }
  };

  // Reordenar planes
  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newOrder = [...plans];
    const [movedPlan] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedPlan);

    const planIds = newOrder.map(plan => plan.id);
    const result = await executeOperation(() => reorderPlans(planIds, mockUser));

    if (result !== null) {
      toast({
        title: "Éxito",
        description: "Orden de planes actualizado",
      });
      revalidate();
    } else {
      toast({
        title: "Error",
        description: operationError || "Error al reordenar los planes",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando planes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Planes</h1>
          <p className="text-muted-foreground">
            Administra los planes de suscripción de tu plataforma
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crear Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Plan</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Plan Básico"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Precio *</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Descripción *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Descripción del plan..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Moneda</label>
                  <Select value={formData.currency} onValueChange={(value) => handleFormChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="COP">COP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Periodo</label>
                  <Select value={formData.period} onValueChange={(value) => handleFormChange('period', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                      <SelectItem value="lifetime">De por vida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <Select value={formData.color} onValueChange={(value) => handleFormChange('color', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_COLORS.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.class}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Características */}
              <div>
                <label className="text-sm font-medium">Características</label>
                <div className="space-y-2">
                  {formData.features?.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`Característica ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Característica
                  </Button>
                </div>
              </div>

              {/* Opciones adicionales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Máximo de usuarios</label>
                  <Input
                    type="number"
                    value={formData.maxUsers || ''}
                    onChange={(e) => handleFormChange('maxUsers', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Sin límite"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Máximo de proyectos</label>
                  <Input
                    type="number"
                    value={formData.maxProjects || ''}
                    onChange={(e) => handleFormChange('maxProjects', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              {/* Opciones booleanas */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleFormChange('isActive', e.target.checked)}
                  />
                  <span className="text-sm">Activo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => handleFormChange('isPopular', e.target.checked)}
                  />
                  <span className="text-sm">Popular</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePlan} disabled={isOperationLoading}>
                {isOperationLoading ? 'Creando...' : 'Crear Plan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                plan.isPopular ? 'ring-2 ring-yellow-400' : ''
              }`}>
                {/* Header con color */}
                <div className={`h-2 ${PLAN_COLORS.find(c => c.value === plan.color)?.class || 'bg-gray-500'}`} />
                
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${PLAN_COLORS.find(c => c.value === plan.color)?.class || 'bg-gray-500'} text-white`}>
                        {PLAN_ICONS.find(icon => icon.value === plan.icon)?.icon ? 
                          React.createElement(PLAN_ICONS.find(icon => icon.value === plan.icon)!.icon, { className: 'w-4 h-4' }) :
                          <Zap className="w-4 h-4" />
                        }
                      </div>
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>
                    
                    {plan.isPopular && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Precio */}
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-sm text-muted-foreground ml-1">
                        /{plan.period === 'monthly' ? 'mes' : plan.period === 'yearly' ? 'año' : 'único'}
                      </span>
                    </div>
                  </div>

                  {/* Características */}
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Límites */}
                  {(plan.maxUsers || plan.maxProjects) && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      {plan.maxUsers && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Máximo {plan.maxUsers} usuarios
                        </div>
                      )}
                      {plan.maxProjects && (
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Máximo {plan.maxProjects} proyectos
                        </div>
                      )}
                    </div>
                  )}

                  {/* Estado */}
                  <div className="flex items-center justify-between">
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Orden: {plan.order}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPlan(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingPlan(plan)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar plan?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar el plan "{plan.name}"? 
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeletePlan}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Contador de planes */}
      <div className="text-center text-muted-foreground">
        {plans.length} plan{plans.length !== 1 ? 'es' : ''} en total
      </div>
    </div>
  );
} 