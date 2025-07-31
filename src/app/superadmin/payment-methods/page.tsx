
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, CreditCard, DollarSign } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NequiIcon from '@/components/icons/nequi-icon';

type PlanName = 'básico' | 'estándar' | 'premium';

interface PaymentMethodConfig {
  enabled: boolean;
  instructions: string;
  [key: string]: any; // For other fields
}

interface PlanPaymentConfig {
  nequi?: PaymentMethodConfig & {
    accountNumber?: string;
    accountHolder?: string;
    identityDocument?: string;
  };
  stripe?: PaymentMethodConfig & {
    publicKey?: string;
    secretKey?: string;
    merchantId?: string;
  };
  mercadoPago?: PaymentMethodConfig & {
    accessToken?: string;
    publicKey?: string;
    country?: string;
    mode?: 'sandbox' | 'production';
  };
}

const initialConfig: Record<PlanName, PlanPaymentConfig> = {
  básico: {
    nequi: {
      enabled: true,
      accountNumber: '',
      accountHolder: '',
      identityDocument: '',
      instructions: 'Realiza el pago a este número vía Nequi y sube el comprobante de pago. Tu plan será activado una vez verifiquemos el pago.',
    },
    stripe: {
      enabled: true,
      publicKey: '',
      secretKey: '',
      merchantId: '',
      instructions: 'Paga con tarjeta de forma segura usando Stripe. La activación es automática una vez completado el pago.',
    },
    mercadoPago: {
      enabled: true,
      accessToken: '',
      publicKey: '',
      country: 'CO',
      mode: 'production',
      instructions: 'Completa tu pago con tarjeta, billetera o QR desde Mercado Pago. Activación automática al finalizar.',
    },
  },
  estándar: {
    stripe: {
      enabled: true,
      publicKey: '',
      secretKey: '',
      merchantId: '',
      instructions: 'Paga con tarjeta de forma segura usando Stripe. Tu plan se activará automáticamente.',
    },
    mercadoPago: {
      enabled: true,
      accessToken: '',
      publicKey: '',
      country: 'CO',
      mode: 'production',
      instructions: 'Realiza el pago fácilmente con tarjeta, QR o billetera desde Mercado Pago. Tu plan se activará al instante.',
    },
  },
  premium: {
    stripe: {
      enabled: true,
      publicKey: '',
      secretKey: '',
      merchantId: '',
      instructions: 'Paga con tarjeta de forma segura usando Stripe. Tu plan se activará automáticamente.',
    },
    mercadoPago: {
      enabled: true,
      accessToken: '',
      publicKey: '',
      country: 'CO',
      mode: 'production',
      instructions: 'Realiza el pago fácilmente con tarjeta, QR o billetera desde Mercado Pago. Tu plan se activará al instante.',
    },
  },
};


const PaymentMethodCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  config: PaymentMethodConfig;
  onConfigChange: (newConfig: Partial<PaymentMethodConfig>) => void;
  children: React.ReactNode;
}> = ({ title, icon, config, onConfigChange, children }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Configura las credenciales y el mensaje para el cliente.</CardDescription>
          </div>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => onConfigChange({ enabled: checked })}
        />
      </div>
    </CardHeader>
    {config.enabled && (
      <CardContent className="space-y-4">
        <div className="space-y-3 p-4 border bg-muted/50 rounded-lg">
            {children}
        </div>
        <div>
          <Label>Instrucción para el cliente</Label>
          <Textarea
            value={config.instructions}
            onChange={(e) => onConfigChange({ instructions: e.target.value })}
            placeholder="Instrucciones que verá el cliente al momento de pagar."
            rows={3}
          />
        </div>
      </CardContent>
    )}
  </Card>
);


export default function SuperAdminPaymentMethodsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState(initialConfig);
  const [activePlan, setActivePlan] = useState<PlanName>('básico');
  const [isSaving, setIsSaving] = useState(false);

  const handleConfigChange = (plan: PlanName, method: keyof PlanPaymentConfig, newValues: Partial<PaymentMethodConfig>) => {
    setConfig(prev => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [method]: {
          ...prev[plan][method],
          ...newValues,
        },
      },
    }));
  };
  
  const handleSave = () => {
    setIsSaving(true);
    // Simulación de guardado en la base de datos
    console.log("Guardando configuración:", JSON.stringify(config, null, 2));
    setTimeout(() => {
        toast({
            title: "Configuración guardada",
            description: "Los métodos de pago han sido actualizados.",
        });
        setIsSaving(false);
    }, 1000);
  };

  const currentPlanConfig = config[activePlan];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Métodos de Pago por Plan</h1>
        <p className="text-lg text-muted-foreground">Configura los métodos de pago disponibles para cada plan de suscripción.</p>
      </div>

      <Tabs value={activePlan} onValueChange={(value) => setActivePlan(value as PlanName)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="básico">Plan Básico</TabsTrigger>
          <TabsTrigger value="estándar">Plan Estándar</TabsTrigger>
          <TabsTrigger value="premium">Plan Premium</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
            <div className="space-y-6">
                {currentPlanConfig.nequi && (
                     <PaymentMethodCard
                        title="Nequi"
                        icon={<NequiIcon className="h-8 w-8" />}
                        config={currentPlanConfig.nequi}
                        onConfigChange={(newValues) => handleConfigChange(activePlan, 'nequi', newValues)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Número Nequi</Label>
                                <Input 
                                    type="text" 
                                    pattern="\d{10}"
                                    maxLength={10}
                                    title="Debe ser un número de 10 dígitos"
                                    value={currentPlanConfig.nequi.accountNumber} 
                                    onChange={(e) => handleConfigChange(activePlan, 'nequi', { accountNumber: e.target.value.replace(/\D/g, '') })} 
                                />
                            </div>
                            <div>
                                <Label>Nombre del Titular</Label>
                                <Input value={currentPlanConfig.nequi.accountHolder} onChange={(e) => handleConfigChange(activePlan, 'nequi', { accountHolder: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <Label>Documento de Identidad</Label>
                            <Input value={currentPlanConfig.nequi.identityDocument} onChange={(e) => handleConfigChange(activePlan, 'nequi', { identityDocument: e.target.value })} />
                        </div>
                    </PaymentMethodCard>
                )}

                {currentPlanConfig.stripe && (
                     <PaymentMethodCard
                        title="Stripe"
                        icon={<CreditCard className="h-8 w-8 text-blue-600" />}
                        config={currentPlanConfig.stripe}
                        onConfigChange={(newValues) => handleConfigChange(activePlan, 'stripe', newValues)}
                    >
                        <div>
                            <Label>Clave Pública (pk_...)</Label>
                            <Input value={currentPlanConfig.stripe.publicKey} onChange={(e) => handleConfigChange(activePlan, 'stripe', { publicKey: e.target.value })} />
                        </div>
                        <div>
                            <Label>Clave Secreta (sk_...)</Label>
                            <Input type="password" value={currentPlanConfig.stripe.secretKey} onChange={(e) => handleConfigChange(activePlan, 'stripe', { secretKey: e.target.value })} />
                        </div>
                        <div>
                            <Label>ID del Comercio (Opcional)</Label>
                            <Input value={currentPlanConfig.stripe.merchantId} onChange={(e) => handleConfigChange(activePlan, 'stripe', { merchantId: e.target.value })} />
                        </div>
                    </PaymentMethodCard>
                )}

                 {currentPlanConfig.mercadoPago && (
                     <PaymentMethodCard
                        title="Mercado Pago"
                        icon={<DollarSign className="h-8 w-8 text-sky-500" />}
                        config={currentPlanConfig.mercadoPago}
                        onConfigChange={(newValues) => handleConfigChange(activePlan, 'mercadoPago', newValues)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Access Token</Label>
                                <Input type="password" value={currentPlanConfig.mercadoPago.accessToken} onChange={(e) => handleConfigChange(activePlan, 'mercadoPago', { accessToken: e.target.value })} />
                            </div>
                            <div>
                                <Label>Public Key</Label>
                                <Input value={currentPlanConfig.mercadoPago.publicKey} onChange={(e) => handleConfigChange(activePlan, 'mercadoPago', { publicKey: e.target.value })} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>País</Label>
                                <Select value={currentPlanConfig.mercadoPago.country} onValueChange={(value) => handleConfigChange(activePlan, 'mercadoPago', { country: value })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CO">Colombia</SelectItem>
                                        <SelectItem value="AR">Argentina</SelectItem>
                                        <SelectItem value="MX">México</SelectItem>
                                        <SelectItem value="BR">Brasil</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label>Modo de Entorno</Label>
                                <Select value={currentPlanConfig.mercadoPago.mode} onValueChange={(value) => handleConfigChange(activePlan, 'mercadoPago', { mode: value as any })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                                        <SelectItem value="production">Producción (Real)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </PaymentMethodCard>
                )}
            </div>
        </div>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? 'Guardando...' : `Guardar Configuración para Plan ${activePlan.charAt(0).toUpperCase() + activePlan.slice(1)}`}
        </Button>
      </div>
    </div>
  );
}
