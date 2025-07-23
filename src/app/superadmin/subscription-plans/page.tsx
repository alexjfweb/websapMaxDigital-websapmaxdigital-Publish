
"use client";
import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLandingPlans, useLandingPlansCRUD, usePlanState, usePlanAuditLogs } from '@/hooks/use-landing-plans';
import { LandingPlan, CreatePlanRequest, UpdatePlanRequest } from '@/services/landing-plans-service';
import { toast } from '@/hooks/use-toast';

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

export default function SubscriptionPlansPage() {
  const { plans, isLoading } = useLandingPlans();
  const { createPlan, updatePlan, deletePlan, reorderPlans, isLoading: isCRUDLoading } = useLandingPlansCRUD();
  const { selectedPlan, isEditing, isCreating, startEditing, startCreating, cancelEdit } = usePlanState();
  const [selectedPlanForHistory, setSelectedPlanForHistory] = useState<string | null>(null);
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

  // Simular datos del usuario (en producción vendría del contexto de autenticación)
  const currentUser = {
    id: 'superadmin',
    email: 'superadmin@websapmax.com'
  };

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
      features: [...(prev.features || []), '']
    }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.description || !formData.features?.length) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive"
        });
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

      if (isEditing && selectedPlan) {
        await updatePlan(selectedPlan.id, planData, currentUser.id, currentUser.email);
        toast({
          title: "Éxito",
          description: "Plan actualizado correctamente"
        });
      } else {
        await createPlan(planData, currentUser.id, currentUser.email);
        toast({
          title: "Éxito",
          description: "Plan creado correctamente"
        });
      }

      cancelEdit();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (plan: LandingPlan) => {
    try {
      await deletePlan(plan.id, currentUser.id, currentUser.email);
      toast({
        title: "Éxito",
        description: "Plan eliminado correctamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReorder = async (planId: string, direction: 'up' | 'down') => {
    const currentIndex = plans.findIndex(p => p.id === planId);
    if (currentIndex === -1) return;

    const newPlans = [...plans];
    if (direction === 'up' && currentIndex > 0) {
      [newPlans[currentIndex], newPlans[currentIndex - 1]] = [newPlans[currentIndex - 1], newPlans[currentIndex]];
    } else if (direction === 'down' && currentIndex < newPlans.length - 1) {
      [newPlans[currentIndex], newPlans[currentIndex + 1]] = [newPlans[currentIndex + 1], newPlans[currentIndex]];
    }

    try {
      await reorderPlans(newPlans.map(p => p.id), currentUser.id, currentUser.email);
      toast({
        title: "Éxito",
        description: "Orden actualizado correctamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

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
      maxUsers: 5,
      maxProjects: 10,
      ctaText: 'Comenzar Prueba Gratuita'
    });
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
    startEditing(plan);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Planes de Suscripción</h1>
          <p className="text-gray-600 mt-2">
            Administra los planes que se muestran en la página principal
          </p>
        </div>
        <Button onClick={startCreating} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Crear Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{plans.length}</div>
            <div className="text-sm text-gray-600">Total de Planes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {plans.filter(p => p.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Planes Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {plans.filter(p => p.isPopular).length}
            </div>
            <div className="text-sm text-gray-600">Planes Populares</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ${plans.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Precio Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        <AnimatePresence>
          {plans.map((plan, index) => {
            const IconComponent = getIconComponent(plan.icon);
            const colorClass = getColorClass(plan.color);
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white`}>
                          <IconComponent size={24} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-semibold">{plan.name}</h3>
                            {plan.isPopular && (
                              <Badge className="bg-yellow-400 text-yellow-900">Popular</Badge>
                            )}
                            {!plan.isActive && (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                          </div>
                          <p className="text-gray-600">{plan.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>${plan.price}/{plan.period === 'monthly' ? 'mes' : plan.period === 'yearly' ? 'año' : 'único'}</span>
                            <span>Orden: {plan.order}</span>
                            <span>{plan.features.length} características</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Reorder Buttons */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(plan.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(plan.id, 'down')}
                          disabled={index === plans.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>

                        {/* History Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPlanForHistory(plan.id)}
                            >
                              <History className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Historial de Cambios - {plan.name}</DialogTitle>
                            </DialogHeader>
                            {selectedPlanForHistory && (
                              <PlanHistoryDialog planId={selectedPlanForHistory} />
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(plan)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar plan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El plan será marcado como inactivo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(plan)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
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

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={cancelEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Crear Nuevo Plan' : 'Editar Plan'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Plan Básico"
                />
              </div>
              <div>
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="29.99"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción del plan..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
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
                <Label htmlFor="period">Período</Label>
                <Select value={formData.period} onValueChange={(value) => handleInputChange('period', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map(period => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ctaText">Texto del Botón</Label>
                <Input
                  id="ctaText"
                  value={formData.ctaText}
                  onChange={(e) => handleInputChange('ctaText', e.target.value)}
                  placeholder="Comenzar Prueba Gratuita"
                />
              </div>
            </div>

            {/* Visual Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Ícono</Label>
                <Select value={formData.icon} onValueChange={(value) => handleInputChange('icon', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_ICONS.map(icon => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center space-x-2">
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_COLORS.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded ${color.class}`}></div>
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxUsers">Límite de Usuarios (-1 = ilimitado)</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value) || 0)}
                  placeholder="5"
                />
              </div>
              <div>
                <Label htmlFor="maxProjects">Límite de Proyectos (-1 = ilimitado)</Label>
                <Input
                  id="maxProjects"
                  type="number"
                  value={formData.maxProjects}
                  onChange={(e) => handleInputChange('maxProjects', parseInt(e.target.value) || 0)}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <Label>Características *</Label>
              <div className="space-y-2">
                {formData.features?.map((feature, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Característica ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      disabled={formData.features?.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Característica
                </Button>
              </div>
            </div>

            {/* Switches */}
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Plan Activo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPopular"
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => handleInputChange('isPopular', checked)}
                />
                <Label htmlFor="isPopular">Plan Popular</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={cancelEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isCRUDLoading}>
              {isCRUDLoading ? 'Guardando...' : (isCreating ? 'Crear Plan' : 'Actualizar Plan')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para mostrar el historial de cambios
function PlanHistoryDialog({ planId }: { planId: string }) {
  const { logs, isLoading, rollbackPlan } = usePlanAuditLogs(planId);
  
  // Simular datos del usuario
  const currentUser = {
    id: 'superadmin',
    email: 'superadmin@websapmax.com'
  };

  const handleRollback = async (auditLogId: string) => {
    try {
      await rollbackPlan(auditLogId, currentUser.id, currentUser.email);
      toast({
        title: "Éxito",
        description: "Plan restaurado correctamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Cargando historial...</div>;
  }

  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay historial de cambios</p>
      ) : (
        logs.map((log) => (
          <Card key={log.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant={log.action === 'created' ? 'default' : log.action === 'updated' ? 'secondary' : 'destructive'}>
                    {log.action === 'created' ? 'Creado' : log.action === 'updated' ? 'Actualizado' : 'Eliminado'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Por: {log.userEmail}
                </p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="text-xs text-gray-500">
                    <pre className="whitespace-pre-wrap">
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
        ))
      )}
    </div>
  );
}
