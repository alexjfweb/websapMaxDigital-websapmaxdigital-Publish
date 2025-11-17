
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { BrainCircuit, Save, TestTube2, CheckCircle, AlertTriangle, Power, PowerOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import Image from "next/image";

// Mock de proveedores y modelos
const aiProviders = [
  { name: "Google Gemini", logo: "/google-gemini-logo.svg", models: ["gemini-pro", "gemini-1.5-flash"] },
  { name: "OpenAI GPT", logo: "/openai-logo.svg", models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"] },
  { name: "Custom API", logo: "/api-logo.svg", models: [] },
];

export default function AIConfigPage() {
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
    // Simular prueba de conexión
    toast({ title: "Probando Conexión...", description: "Por favor espera." });
    setTimeout(() => {
      // Simular éxito o error aleatoriamente
      if (Math.random() > 0.3) {
        setConnectionStatus("connected");
        toast({ title: "¡Conexión Exitosa!", description: `Conectado correctamente a ${selectedProvider.name} con el modelo ${selectedModel}.`, className: "bg-green-100 text-green-800" });
      } else {
        setConnectionStatus("error");
        toast({ title: "Error de Conexión", description: "No se pudo verificar la clave API o el modelo. Revisa tus credenciales.", variant: "destructive" });
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <BrainCircuit className="h-8 w-8"/>
          Integración de Modelos de IA
        </h1>
        <p className="text-lg text-muted-foreground">Conecta y configura los proveedores de IA que potenciarán tus sugerencias.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Configuración de API</CardTitle>
            <CardDescription>Selecciona un proveedor e introduce tus credenciales de API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Proveedor de IA</Label>
                <div className="flex gap-2 flex-wrap">
                    {aiProviders.map(provider => (
                        <Button key={provider.name} variant={selectedProvider.name === provider.name ? "default" : "outline"} onClick={() => handleProviderChange(provider.name)}>
                             {/* No podemos usar Image por ahora sin la config */}
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
             
          </CardContent>
        </Card>
        
        <Card className="shadow-lg sticky top-6">
          <CardHeader>
            <CardTitle>Parámetros Avanzados</CardTitle>
            <CardDescription>Ajusta el comportamiento del modelo de IA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <p className="text-xs text-muted-foreground">Valores bajos generan respuestas más predecibles, valores altos generan más creatividad.</p>
            </div>
            <div className="space-y-2">
              <Label>Tokens Máximos</Label>
              <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Controla la longitud máxima de la respuesta generada por la IA.</p>
            </div>
            <Button className="w-full" onClick={handleSaveConfig}>
                <Save className="mr-2"/>
                Guardar Configuración
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    