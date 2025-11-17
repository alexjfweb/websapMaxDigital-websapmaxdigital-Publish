
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Clock, Zap, MessageSquare, ShoppingBag, BrainCircuit, BarChart2, DollarSign, TrendingUp, ArrowRight, ArrowDown, Loader2, Settings, TestTube2, CheckCircle, AlertTriangle, PowerOff, Save, Edit, Trash2 } from "lucide-react";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { suggestionRuleService, SuggestionRule } from '@/services/suggestion-rules-service';
import { useSession } from '@/contexts/session-context';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";


// --- AI Configuration Component ---
const aiProviders = [
  { name: "Google Gemini", models: ["gemini-pro", "gemini-1.5-flash"] },
  { name: "OpenAI GPT", models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"] },
  { name: "Custom API", models: [] },
];

const AIConfigDialog = () => {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState(aiProviders[0]);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState(selectedProvider.models[0]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [connectionStatus, setConnectionStatus] = useState<"unconfigured" | "connected" | "error">("unconfigured");

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
     if (connectionStatus !== 'connected') {
       toast({ title: "Prueba la conexión primero", description: "Debes probar la conexión exitosamente antes de guardar.", variant: "destructive" });
       return;
     }
     toast({ title: "Configuración Guardada", description: "Tu configuración de IA ha sido guardada." });
  }

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <BrainCircuit className="h-6 w-6" />
          Configuración del Motor de IA
        </DialogTitle>
        <DialogDescription>
          Conecta tu proveedor de IA preferido para potenciar las sugerencias.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        {/* Columna Izquierda: Configuración de API */}
        <div className="space-y-4">
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

            <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
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
            </div>

            <div className="flex items-center gap-4">
                <Button onClick={handleTestConnection}><TestTube2 className="mr-2"/>Probar Conexión</Button>
                <div className="flex items-center gap-2">
                  {connectionStatus === 'connected' && <><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-sm font-medium text-green-600">Conectado</span></>}
                  {connectionStatus === 'error' && <><AlertTriangle className="h-5 w-5 text-destructive" /><span className="text-sm font-medium text-destructive">Error</span></>}
                  {connectionStatus === 'unconfigured' && <><PowerOff className="h-5 w-5 text-muted-foreground" /><span className="text-sm font-medium text-muted-foreground">No configurado</span></>}
                </div>
            </div>
        </div>

        {/* Columna Derecha: Parámetros */}
        <div className="p-4 border rounded-lg space-y-6">
            <h3 className="font-semibold text-lg">Parámetros del Modelo</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                  <Label>Temperatura / Creatividad</Label>
                  <span className="text-sm font-medium text-primary">{temperature.toFixed(2)}</span>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={(v) => setTemperature(v[0])}
                min={0}
                max={2}
                step={0.01}
              />
              <p className="text-xs text-muted-foreground">Valores más altos = más creativo. Valores bajos = más predecible.</p>
            </div>
            <div className="space-y-2">
              <Label>Tokens Máximos (Longitud de Respuesta)</Label>
              <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} />
            </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSaveConfig}>
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
                    <p className="text-sm text-muted-foreground">Aumento en Ticket Promedio</p>
                    <p className="text-4xl font-bold text-green-600">+12%</p>
                </div>
                
                <div>
                    <Label className="font-semibold">Conversión de Reglas</Label>
                    <div className="h-24 mt-2 bg-gray-100 rounded-md flex items-end justify-around p-2">
                        {/* Placeholder para el gráfico de barras */}
                        <div className="w-6 bg-blue-400 rounded-t-sm" style={{height: '40%'}}></div>
                        <div className="w-6 bg-blue-400 rounded-t-sm" style={{height: '75%'}}></div>
                        <div className="w-6 bg-blue-400 rounded-t-sm" style={{height: '60%'}}></div>
                        <div className="w-6 bg-blue-400 rounded-t-sm" style={{height: '85%'}}></div>
                        <div className="w-6 bg-blue-400 rounded-t-sm" style={{height: '50%'}}></div>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-3 border rounded-md">
                    <TrendingUp className="h-8 w-8 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Ingresos Atribuidos</p>
                        <p className="text-xl font-bold">+$2,500 USD</p>
                        <p className="text-xs text-muted-foreground">(últimos 30 días)</p>
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

