"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Clock, Zap, MessageSquare, ShoppingBag, BrainCircuit, BarChart2, DollarSign, TrendingUp, ArrowRight, ArrowDown, Loader2 } from "lucide-react";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { suggestionRuleService, SuggestionRule } from '@/services/suggestion-rules-service';
import { useSession } from '@/contexts/session-context';

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
        <div className="flex justify-center items-center gap-4 mt-4 text-gray-500">
            {/* Controles del diagrama (placeholders) */}
            <Button variant="ghost" size="icon"><i className="i-lucide-zoom-in"></i></Button>
            <Button variant="ghost" size="icon"><i className="i-lucide-zoom-out"></i></Button>
            <Button variant="ghost" size="icon"><i className="i-lucide-rotate-cw"></i></Button>
        </div>
    </div>
  </div>
);


export default function SuggestionsEnginePage() {
  const { toast } = useToast();
  const { currentUser } = useSession();
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveRule = async () => {
    if (!currentUser?.companyId) {
      toast({ title: "Error", description: "No se pudo identificar la compañía.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const newRule: Omit<SuggestionRule, 'id'> = {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await suggestionRuleService.createRule(newRule);
      toast({ title: "¡Regla Guardada!", description: "La nueva regla de sugerencia se ha guardado correctamente." });

    } catch (error: any) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <BrainCircuit className="h-8 w-8" />
            Motor de Sugerencias Inteligentes
          </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Editor de Reglas */}
        <div className="lg:col-span-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Crear Nueva Regla</CardTitle>
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
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSaving ? 'Guardando...' : 'Guardar Regla'}
                </Button>
                <Button variant="ghost">Cancelar</Button>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
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
    </div>
  );
}
