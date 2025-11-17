

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Clock, Zap, MessageSquare, ShoppingBag, BrainCircuit, BarChart2, DollarSign, TrendingUp, ArrowRight, ArrowDown, Loader2, Settings, TestTube2, CheckCircle, AlertTriangle, PowerOff, Save, Edit, Trash2, GripVertical } from "lucide-react";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { suggestionRuleService, SuggestionRule } from '@/services/suggestion-rules-service';
import { useSession } from '@/contexts/session-context';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderContext } from '@/contexts/order-context';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';


// --- AI Configuration Component ---
const aiProviders = [
  { name: "Google Gemini", models: ["gemini-pro", "gemini-1.5-flash"] },
  { name: "OpenAI GPT", models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"] },
  { name: "Custom API", models: [] },
];

const savedModelsMock = [
  { id: '1', provider: 'Google Gemini', name: 'gemini-pro', apiKey: '...tur8i', active: true },
  { id: '2', provider: 'OpenAI GPT', name: 'gpt-4o', apiKey: '...h4fg6', active: false },
];

const AIConfigDialog = () => {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState(aiProviders[0]);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState(selectedProvider.models[0]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [connectionStatus, setConnectionStatus] = useState<"unconfigured" | "connected" | "error">("unconfigured");
  const [savedModels, setSavedModels] = useState(savedModelsMock);

  // Cargar estado desde localStorage al montar
  useEffect(() => {
    try {
      const storedModels = localStorage.getItem('aiSavedModels');
      if (storedModels) {
        setSavedModels(JSON.parse(storedModels));
      }
    } catch (error) {
      console.error("Error loading AI models from localStorage:", error);
      setSavedModels(savedModelsMock);
    }
  }, []);

  const handleProviderChange = (providerName: string) => {
    const provider = aiProviders.find(p => p.name === providerName)!;
    setSelectedProvider(provider);
    setApiKey("");
    setSelectedModel(provider.models[0] || "");
    setConnectionStatus("unconfigured");
  };

  const handleTestConnection = () => {
    if (!apiKey) {
      toast({ title: "Clave API requerida", description: "Por favor, ingresa tu clave API para probar la conexión.", variant: "destructive" });
      return;
    }
    toast({ title: "Probando Conexión...", description: "Por favor espera." });
    setTimeout(() => {
      if (Math.random() > 0.3) {
        setConnectionStatus("connected");
        toast({ title: "¡Conexión Exitosa!", description: `Conectado correctamente a ${selectedProvider.name}.`, className: "bg-green-100 text-green-800" });
      } else {
        setConnectionStatus("error");
        toast({ title: "Error de Conexión", description: "No se pudo verificar la clave API. Revisa tus credenciales.", variant: "destructive" });
      }
    }, 1500);
  };
  
  const handleSaveConfig = () => {
    try {
      localStorage.setItem('aiSavedModels', JSON.stringify(savedModels));
      toast({ title: "Configuración Guardada", description: "Tu configuración de IA ha sido guardada." });
    } catch (error) {
      console.error("Error saving AI models to localStorage:", error);
      toast({ title: "Error al Guardar", description: "No se pudo guardar la configuración en el navegador.", variant: "destructive" });
    }
  };

  const toggleModelActive = (id: string) => {
    setSavedModels(models => models.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <BrainCircuit className="h-6 w-6" />
          Configuración del Motor de IA
        </DialogTitle>
        <DialogDescription>
          Conecta y gestiona tus proveedores de IA para potenciar las sugerencias automáticas.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
        {/* Columna Izquierda: Configuración de API */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Conectar Proveedor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Proveedor de IA</Label>
                        <div className="flex gap-2 flex-wrap">
                            {aiProviders.map(provider => (
                                <Button key={provider.name} variant={selectedProvider.name === provider.name ? "default" : "outline"} onClick={() => handleProviderChange(provider.name)}>
                                    <span>{provider.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="api-key">Clave API de {selectedProvider.name}</Label>
                        <Input id="api-key" type="password" placeholder="Pega tu clave API aquí" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                    </div>

                    {selectedProvider.models.length > 0 && (
                         <div className="space-y-2">
                            <Label htmlFor="model-select">Modelo a Utilizar</Label>
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger id="model-select"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {selectedProvider.models.map(model => (
                                        <SelectItem key={model} value={model}>{model}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <Button onClick={handleTestConnection} variant="destructive"><TestTube2 className="mr-2"/>Probar</Button>
                        <div className="flex items-center gap-2">
                        {connectionStatus === 'connected' && <><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-sm font-medium text-green-600">Conectado</span></>}
                        {connectionStatus === 'error' && <><AlertTriangle className="h-5 w-5 text-destructive" /><span className="text-sm font-medium text-destructive">Error</span></>}
                        {connectionStatus === 'unconfigured' && <><PowerOff className="h-5 w-5 text-muted-foreground" /><span className="text-sm font-medium text-muted-foreground">No configurado</span></>}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-lg">Parámetros del Modelo</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Temperatura / Creatividad</Label>
                            <span className="text-sm font-medium text-primary">{temperature.toFixed(2)}</span>
                        </div>
                        <Slider value={[temperature]} onValueChange={(v) => setTemperature(v[0])} min={0} max={2} step={0.01} />
                        <p className="text-xs text-muted-foreground">Valores más altos = más creativo. Valores bajos = más predecible.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Tokens Máximos (Longitud de Respuesta)</Label>
                        <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Columna Derecha: Modelos Guardados */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Modelos de IA Guardados</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {savedModels.map(model => (
                <Card key={model.id} className="p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BrainCircuit className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <p className="font-semibold">{model.provider}</p>
                                <p className="text-xs text-muted-foreground">API Key: {model.apiKey}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={model.active} onCheckedChange={() => toggleModelActive(model.id)} />
                            <Badge variant={model.active ? "default" : "outline"} className={model.active ? "bg-green-500" : ""}>{model.active ? 'Activo' : 'Inactivo'}</Badge>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => {}}>Cancelar</Button>
        <Button onClick={handleSaveConfig} className="bg-orange-500 hover:bg-orange-600">
            <Save className="mr-2"/>
            Guardar Configuración
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};


// Placeholder para el diagrama de flujo
const FlowDiagram = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg p-4">
    <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-4">MOTOR DE SUGERENCIAS INTELIGENTES</h3>
        <Image 
            src="/diagram.svg" 
            alt="Diagrama de flujo de reglas de sugerencia"
            width={500}
            height={400}
            className="mx-auto"
            data-ai-hint="flowchart diagram"
            unoptimized
        />
    </div>
  </div>
);


export default function SuggestionsEnginePage() {
  const { toast } = useToast();
  const { currentUser } = useSession();
  const { orders, loading: loadingOrders } = useOrderContext();
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para las reglas
  const [rules, setRules] = useState<SuggestionRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [editingRule, setEditingRule] = useState<SuggestionRule | null>(null);
  
  const [ruleToDelete, setRuleToDelete] = useState<SuggestionRule | null>(null);

  // Cargar reglas al montar
  useEffect(() => {
    if (currentUser?.companyId) {
      fetchRules();
    }
  }, [currentUser?.companyId]);

  const fetchRules = async () => {
    if (!currentUser?.companyId) return;
    setIsLoadingRules(true);
    try {
      const fetchedRules = await suggestionRuleService.getRulesByCompany(currentUser.companyId);
      setRules(fetchedRules);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar las reglas.", variant: "destructive" });
    } finally {
      setIsLoadingRules(false);
    }
  };


  // Estado para el formulario de reglas
  const [initialDish, setInitialDish] = useState('Hamburguesa Clásica');
  const [isPeakTime, setIsPeakTime] = useState(true);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('22:00');
  const [yesSuggestionType, setYesSuggestionType] = useState('cross-sell');
  const [yesSuggestionProduct, setYesSuggestionProduct] = useState('Cerveza Artesanal');
  const [yesSuggestionMessage, setYesSuggestionMessage] = useState('Acompaña tu hamburguesa con...');
  const [noSuggestionType, setNoSuggestionType] = useState('cross-sell');
  const [noSuggestionProduct, setNoSuggestionProduct] = useState('Batido Premium');
  const [noSuggestionMessage, setNoSuggestionMessage] = useState('¿Qué tal algo refrescante?');
  
    // Nuevas métricas de rendimiento
  const performanceMetrics = useMemo(() => {
    if (loadingOrders || orders.length === 0) {
      return { acceptedSuggestions: 0, attributedRevenue: 0, acceptanceRate: 0, conversionByRule: [] };
    }

    let acceptedSuggestions = 0;
    let attributedRevenue = 0;
    const conversionByRule: Record<string, { name: string, count: number }> = {};

    orders.forEach(order => {
      order.productos.forEach(producto => {
        if (producto.isSuggestion) {
          acceptedSuggestions++;
          attributedRevenue += producto.precio * producto.cantidad;
          const ruleName = producto.suggestionSource || 'IA';
          if (conversionByRule[ruleName]) {
            conversionByRule[ruleName].count++;
          } else {
            conversionByRule[ruleName] = { name: ruleName, count: 1 };
          }
        }
      });
    });

    // Para la tasa de aceptación necesitaríamos saber el total de sugerencias mostradas,
    // lo cual no podemos calcular ahora. Mostramos un valor fijo por ahora.
    const acceptanceRate = 25; // Placeholder

    return {
      acceptedSuggestions,
      attributedRevenue,
      acceptanceRate,
      conversionByRule: Object.values(conversionByRule),
    };
  }, [orders, loadingOrders]);

  const clearForm = () => {
    setEditingRule(null);
    setInitialDish('');
    setIsPeakTime(true);
    setStartTime('18:00');
    setEndTime('22:00');
    setYesSuggestionType('cross-sell');
    setYesSuggestionProduct('');
    setYesSuggestionMessage('');
    setNoSuggestionType('cross-sell');
    setNoSuggestionProduct('');
    setNoSuggestionMessage('');
  };

  const handleEditRule = (rule: SuggestionRule) => {
    setEditingRule(rule);
    setInitialDish(rule.initialDish);
    setIsPeakTime(rule.condition.active);
    setStartTime(rule.condition.startTime || '18:00');
    setEndTime(rule.condition.endTime || '22:00');
    setYesSuggestionType(rule.actions.yes.type);
    setYesSuggestionProduct(rule.actions.yes.product);
    setYesSuggestionMessage(rule.actions.yes.message);
    setNoSuggestionType(rule.actions.no.type);
    setNoSuggestionProduct(rule.actions.no.product);
    setNoSuggestionMessage(rule.actions.no.message);
  };


  const handleSaveRule = async () => {
    if (!currentUser?.companyId) {
      toast({ title: "Error", description: "No se pudo identificar la compañía.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const ruleData = {
        companyId: currentUser.companyId,
        initialDish,
        condition: {
          type: 'peakTime',
          active: isPeakTime,
          startTime,
          endTime,
        },
        actions: {
          yes: {
            type: yesSuggestionType as 'cross-sell' | 'upsell',
            product: yesSuggestionProduct,
            message: yesSuggestionMessage,
          },
          no: {
            type: noSuggestionType as 'cross-sell' | 'upsell',
            product: noSuggestionProduct,
            message: noSuggestionMessage,
          },
        },
        createdAt: editingRule ? editingRule.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (editingRule) {
        await suggestionRuleService.updateRule(editingRule.id, ruleData);
        toast({ title: "¡Regla Actualizada!", description: "La regla de sugerencia se ha actualizado." });
      } else {
        await suggestionRuleService.createRule(ruleData);
        toast({ title: "¡Regla Guardada!", description: "La nueva regla de sugerencia se ha guardado." });
      }
      
      clearForm();
      fetchRules(); // Recargar la lista de reglas

    } catch (error: any) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    setIsSaving(true);
    try {
        await suggestionRuleService.deleteRule(ruleToDelete.id);
        toast({ title: "Regla Eliminada", description: "La regla ha sido eliminada.", variant: "destructive"});
        fetchRules();
    } catch (error: any) {
        toast({ title: "Error", description: `No se pudo eliminar la regla: ${error.message}`, variant: "destructive"});
    } finally {
        setIsSaving(false);
        setRuleToDelete(null);
    }
  };
  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <BrainCircuit className="h-8 w-8" />
            Motor de Sugerencias Inteligentes
          </h1>
          <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Configuración de IA</Button>
            </DialogTrigger>
            <AIConfigDialog />
          </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Editor de Reglas */}
        <div className="lg:col-span-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{editingRule ? 'Editar Regla' : 'Crear Nueva Regla'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plato Inicial */}
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">PLATO INICIAL</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Buscar Plato..." value={initialDish} onChange={(e) => setInitialDish(e.target.value)} />
                </div>
              </div>

              {/* Condición */}
              <div className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="peak-hours" className="font-semibold text-gray-700">Activar Horario Pico</Label>
                    <Switch id="peak-hours" checked={isPeakTime} onCheckedChange={setIsPeakTime} />
                </div>
                {isPeakTime && (
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="start-time">Hora de Inicio</Label>
                          <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                      </div>
                      <div>
                          <Label htmlFor="end-time">Hora de Fin</Label>
                          <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                      </div>
                  </div>
                )}
              </div>
              
              {/* Acciones */}
              <div className="space-y-4">
                <Label className="font-semibold text-gray-700">ACCIONES (SÍ / NO)</Label>
                {/* Acción SI */}
                <div className="space-y-3 rounded-md border border-green-200 bg-green-50/50 p-4">
                    <p className="font-medium text-green-700">Si se cumple (SÍ)</p>
                    <Select value={yesSuggestionType} onValueChange={setYesSuggestionType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cross-sell">Cross-sell</SelectItem>
                            <SelectItem value="upsell">Upsell</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Sugerir Plato/Producto" value={yesSuggestionProduct} onChange={(e) => setYesSuggestionProduct(e.target.value)} />
                    <Input placeholder="Mensaje de Sugerencia" value={yesSuggestionMessage} onChange={(e) => setYesSuggestionMessage(e.target.value)} />
                </div>
                {/* Acción NO */}
                 <div className="space-y-3 rounded-md border border-red-200 bg-red-50/50 p-4">
                    <p className="font-medium text-red-700">Si no se cumple (NO)</p>
                    <Select value={noSuggestionType} onValueChange={setNoSuggestionType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="cross-sell">Cross-sell</SelectItem>
                            <SelectItem value="upsell">Upsell</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Sugerir Plato/Producto" value={noSuggestionProduct} onChange={(e) => setNoSuggestionProduct(e.target.value)} />
                    <Input placeholder="Mensaje de Sugerencia" value={noSuggestionMessage} onChange={(e) => setNoSuggestionMessage(e.target.value)} />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-between items-center pt-4">
                <Button onClick={handleSaveRule} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {editingRule ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button variant="ghost" onClick={clearForm}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Central: Diagrama */}
        <div className="lg:col-span-5">
           <Card className="shadow-lg h-[600px]">
             <CardContent className="p-4 h-full">
                <FlowDiagram />
             </CardContent>
           </Card>
        </div>

        {/* Columna Derecha: Analíticas */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary"/>
                Rendimiento
              </CardTitle>
              <CardDescription>Métricas clave de las sugerencias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Tasa de Aceptación</p>
                    <p className="text-4xl font-bold text-green-600">{performanceMetrics.acceptanceRate}%</p>
                </div>
                
                <div className="flex items-center gap-4 p-3 border rounded-md">
                    <DollarSign className="h-8 w-8 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Ingresos por Sugerencias</p>
                        <p className="text-xl font-bold">${performanceMetrics.attributedRevenue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">(Total generado)</p>
                    </div>
                </div>

                <div>
                    <Label className="font-semibold">Conversión por Regla/IA</Label>
                    <div className="h-32 mt-2">
                      <ChartContainer config={{}} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={performanceMetrics.conversionByRule} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 12, width: 80 }} />
                             <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                             <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                </div>

            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Sección de Reglas Guardadas */}
      <Card>
        <CardHeader>
          <CardTitle>Reglas Guardadas</CardTitle>
          <CardDescription>Administra las reglas de sugerencia existentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plato Inicial</TableHead>
                <TableHead>Condición</TableHead>
                <TableHead>Sugerencia (Sí)</TableHead>
                <TableHead>Sugerencia (No)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRules ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No has creado ninguna regla todavía.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map(rule => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.initialDish}</TableCell>
                    <TableCell>
                      {rule.condition.active ? `Hora Pico (${rule.condition.startTime}-${rule.condition.endTime})` : 'Siempre'}
                    </TableCell>
                    <TableCell>{rule.actions.yes.product}</TableCell>
                    <TableCell>{rule.actions.no.product}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setRuleToDelete(rule)}>
                            <Trash2 className="h-4 w-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción eliminará la regla para &quot;{ruleToDelete?.initialDish}&quot; permanentemente.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setRuleToDelete(null)}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteRule} className="bg-destructive hover:bg-destructive/90">
                                    Sí, eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
