
"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { Save, CreditCard, DollarSign, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NequiIcon from '@/components/icons/nequi-icon';
import BancolombiaIcon from '@/components/icons/bancolombia-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { storageService } from '@/services/storage-service';
import Image from 'next/image';

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
  nequiQr?: PaymentMethodConfig & {
    qrImageUrl?: string;
    accountNumber?: string;
    accountHolder?: string;
    identityDocument?: string;
  };
  bancolombiaQr?: PaymentMethodConfig & {
    qrImageUrl?: string;
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
    nequi: { enabled: true, accountNumber: '', accountHolder: '', identityDocument: '', instructions: 'Realiza el pago a este número vía Nequi y sube el comprobante de pago. Tu plan será activado una vez verifiquemos el pago.' },
    nequiQr: { enabled: true, qrImageUrl: '', accountNumber: '', accountHolder: '', identityDocument: '', instructions: 'Escanea este código QR desde tu app Nequi para realizar el pago.\nLuego, sube el comprobante o haz clic en “Ya pagué” para que podamos verificar y activar tu plan.' },
    bancolombiaQr: { enabled: true, qrImageUrl: '', accountNumber: '', accountHolder: '', identityDocument: '', instructions: 'Escanea el código QR desde la App Bancolombia. Sube el comprobante para que podamos verificar y activar tu plan.' },
    stripe: { enabled: false, publicKey: '', secretKey: '', merchantId: '', instructions: 'Paga con tarjeta de forma segura usando Stripe. La activación es automática una vez completado el pago.' },
    mercadoPago: { enabled: false, accessToken: '', publicKey: '', country: 'CO', mode: 'production', instructions: 'Completa tu pago con tarjeta, billetera o QR desde Mercado Pago. Activación automática al finalizar.' },
  },
  estándar: {
    bancolombiaQr: { enabled: true, qrImageUrl: '', accountNumber: '', accountHolder: '', identityDocument: '', instructions: 'Escanea el código QR desde la App Bancolombia. Sube el comprobante para que podamos verificar y activar tu plan.' },
    nequiQr: { enabled: true, qrImageUrl: '', accountNumber: '', accountHolder: '', identityDocument: '', instructions: 'Escanea este código QR desde tu app Nequi para realizar el pago.' },
    stripe: { enabled: true, publicKey: '', secretKey: '', merchantId: '', instructions: 'Paga con tarjeta de forma segura usando Stripe. Tu plan se activará automáticamente.' },
    mercadoPago: { enabled: true, accessToken: '', publicKey: '', country: 'CO', mode: 'production', instructions: 'Realiza el pago fácilmente con tarjeta, QR o billetera desde Mercado Pago. Tu plan se activará al instante.' },
  },
  premium: {
     bancolombiaQr: { enabled: true, qrImageUrl: '', accountNumber: '', accountHolder: '', identityDocument: '', instructions: 'Escanea el código QR desde la App Bancolombia. Sube el comprobante para que podamos verificar y activar tu plan.' },
     nequiQr: { enabled: true, qrImageUrl: '', accountNumber: '', accountHolder: '', identityDocument: '', instructions: 'Escanea este código QR desde tu app Nequi para realizar el pago.' },
    stripe: { enabled: true, publicKey: '', secretKey: '', merchantId: '', instructions: 'Paga con tarjeta de forma segura usando Stripe. Tu plan se activará automáticamente.' },
    mercadoPago: { enabled: true, accessToken: '', publicKey: '', country: 'CO', mode: 'production', instructions: 'Realiza el pago fácilmente con tarjeta, QR o billetera desde Mercado Pago. Tu plan se activará al instante.' },
  },
};

const PaymentMethodCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  config?: PaymentMethodConfig;
  onConfigChange: (newConfig: Partial<PaymentMethodConfig>) => void;
  children: React.ReactNode;
}> = ({ title, icon, config, onConfigChange, children }) => {
    if (!config) return null; // Si el método no está definido para el plan, no lo renderiza.

    return (
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
            <CardContent>
                <div className="space-y-3 p-4 border bg-muted/50 rounded-lg">
                    {children}
                </div>
                <div className="mt-4">
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
};


const CONFIG_DOC_ID = 'main_payment_methods';

export default function SuperAdminPaymentMethodsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState(initialConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<PlanName>('básico');
  const [isSaving, setIsSaving] = useState(false);
  
  // Archivos seleccionados pendientes de subir
  const [qrFiles, setQrFiles] = useState<Record<PlanName, { nequiQr?: File; bancolombiaQr?: File }>>({
    básico: {},
    estándar: {},
    premium: {},
  });
  
  const [qrPreviews, setQrPreviews] = useState<Record<PlanName, { nequiQr?: string; bancolombiaQr?: string }>>({
    básico: {},
    estándar: {},
    premium: {},
  });

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const db = getDb();
        const docRef = doc(db, "payment_methods", CONFIG_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dbConfig = docSnap.data() as Record<PlanName, PlanPaymentConfig>;
          const mergedConfig = { ...initialConfig };
          for (const plan of Object.keys(mergedConfig) as PlanName[]) {
              if (dbConfig[plan]) {
                 mergedConfig[plan] = { ...initialConfig[plan], ...dbConfig[plan] };
              }
          }
          setConfig(mergedConfig);
        } else {
          console.log("El documento de configuración de pagos no existe. Creando uno por defecto...");
          const db = getDb();
          await setDoc(doc(db, "payment_methods", CONFIG_DOC_ID), { ...initialConfig, createdAt: serverTimestamp() });
          setConfig(initialConfig);
          toast({ title: "Configuración Inicial Creada", description: "Se ha creado un archivo de configuración de pagos por defecto."});
        }
      } catch (error) {
        toast({ title: "Error", description: "No se pudo cargar la configuración de pagos.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [toast]);


    const handleConfigChange = (plan: PlanName, method: keyof PlanPaymentConfig, newValues: Partial<PaymentMethodConfig>) => {
        setConfig(prev => {
            const newConfig = JSON.parse(JSON.stringify(prev)); // Deep copy

            // Si se modifica Nequi, sincronizar los datos (excepto 'enabled') en todos los planes.
            if (method === 'nequiQr') {
                const { enabled, ...dataToSync } = newValues;

                (Object.keys(newConfig) as PlanName[]).forEach(p => {
                    if (newConfig[p][method]) {
                        // Sincronizar solo los datos, no el estado de activación
                        newConfig[p][method] = { ...newConfig[p][method], ...dataToSync };
                    }
                });

                // Actualizar el estado 'enabled' solo para el plan activo
                if (newValues.enabled !== undefined) {
                    newConfig[plan][method]!.enabled = newValues.enabled;
                }
            } else {
                // Para otros métodos, actualizar solo el plan activo
                const existingMethodConfig = newConfig[plan][method] || { enabled: false, instructions: '' };
                newConfig[plan][method] = { ...existingMethodConfig, ...newValues };
            }

            return newConfig;
        });
    };
  
  const handleSave = async () => {
    setIsSaving(true);
    let updatedConfig = JSON.parse(JSON.stringify(config)); // Deep copy

    try {
        for (const plan of Object.keys(qrFiles) as PlanName[]) {
            const planFiles = qrFiles[plan];
            for (const method of Object.keys(planFiles) as Array<keyof typeof planFiles>) {
                const file = planFiles[method];
                if (file) {
                    toast({ title: `Subiendo QR para ${plan}...`, description: 'Por favor, espera.' });
                    const currentImageUrl = updatedConfig[plan][method]?.qrImageUrl;
                    if (currentImageUrl) {
                        await storageService.deleteFile(currentImageUrl).catch(e => console.warn("Could not delete old file, it might not exist", e));
                    }
                    const newUrl = await storageService.compressAndUploadFile(file, `payment_qrs/${plan}/${method}`);
                    
                    // Si es Nequi, actualizar la URL en todos los planes
                    if (method === 'nequiQr') {
                        for (const p of Object.keys(updatedConfig) as PlanName[]) {
                           if(updatedConfig[p][method]) {
                                updatedConfig[p][method]!.qrImageUrl = newUrl;
                           }
                        }
                    } else {
                        updatedConfig[plan][method]!.qrImageUrl = newUrl;
                    }
                }
            }
        }
        
        const db = getDb();
        const docRef = doc(db, "payment_methods", CONFIG_DOC_ID);
        await setDoc(docRef, { ...updatedConfig, lastUpdated: serverTimestamp() }, { merge: true });
        setConfig(updatedConfig);
        setQrFiles({ básico: {}, estándar: {}, premium: {} }); // Limpiar archivos pendientes
        toast({
            title: "Configuración guardada",
            description: "Los métodos de pago han sido actualizados.",
        });
    } catch (e) {
        console.error("Error al guardar:", e);
        toast({ title: "Error", description: "No se pudo guardar la configuración.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleQrImageSelection = (e: ChangeEvent<HTMLInputElement>, plan: PlanName, method: 'nequiQr' | 'bancolombiaQr') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Archivo demasiado grande", description: "La imagen no debe superar los 5MB.", variant: "destructive" });
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast({ title: "Formato no válido", description: "Solo se admiten imágenes JPG o PNG.", variant: "destructive" });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;

        // Si es Nequi, actualiza el archivo y la vista previa para todos los planes
        if (method === 'nequiQr') {
            setQrFiles(prev => ({
                básico: { ...prev.básico, nequiQr: file },
                estándar: { ...prev.estándar, nequiQr: file },
                premium: { ...prev.premium, nequiQr: file },
            }));
            setQrPreviews(prev => ({
                básico: { ...prev.básico, nequiQr: previewUrl },
                estándar: { ...prev.estándar, nequiQr: previewUrl },
                premium: { ...prev.premium, nequiQr: previewUrl },
            }));
        } else {
            // Para otros métodos (Bancolombia), solo para el plan activo
            setQrFiles(prev => ({
                ...prev,
                [plan]: { ...prev[plan], [method]: file }
            }));
            setQrPreviews(prev => ({
                ...prev,
                [plan]: { ...prev[plan], [method]: previewUrl }
            }));
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const currentPlanConfig = config[activePlan];

  if (isLoading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-10 w-1/4"/>
            <Skeleton className="h-6 w-1/2"/>
            <Tabs defaultValue="básico" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="básico">Plan Básico</TabsTrigger>
                    <TabsTrigger value="estándar">Plan Estándar</TabsTrigger>
                    <TabsTrigger value="premium">Plan Premium</TabsTrigger>
                </TabsList>
            </Tabs>
            <Card><CardContent className="p-6"><Skeleton className="h-64 w-full"/></CardContent></Card>
            <Card><CardContent className="p-6"><Skeleton className="h-48 w-full"/></CardContent></Card>
        </div>
    );
  }

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

                <PaymentMethodCard
                    title="Nequi con Código QR"
                    icon={<NequiIcon className="h-8 w-8" />}
                    config={currentPlanConfig.nequiQr}
                    onConfigChange={(newValues) => handleConfigChange(activePlan, 'nequiQr', newValues)}
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-4">
                             <div>
                                <Label htmlFor={`nequi-qr-upload-${activePlan}`}>Imagen del Código QR (JPG/PNG, máx 5MB)</Label>
                                <Button asChild variant="outline" className="w-full mt-1">
                                    <label htmlFor={`nequi-qr-upload-${activePlan}`} className="cursor-pointer flex items-center gap-2">
                                        <UploadCloud className="h-4 w-4" />
                                        Seleccionar o cambiar QR
                                        <Input 
                                            id={`nequi-qr-upload-${activePlan}`}
                                            type="file" 
                                            className="hidden"
                                            accept="image/jpeg, image/png"
                                            onChange={(e) => handleQrImageSelection(e, activePlan, 'nequiQr')} 
                                        />
                                    </label>
                                </Button>
                            </div>
                            <div>
                                <Label>Número de cuenta asociado *</Label>
                                <Input
                                    value={config.básico.nequiQr?.accountNumber || ''}
                                    onChange={(e) => handleConfigChange(activePlan, 'nequiQr', { accountNumber: e.target.value.replace(/\D/g, '') })}
                                    placeholder="3001234567"
                                />
                            </div>
                        </div>
                        <div className="text-center">
                            <Label>Vista Previa QR</Label>
                            <Image 
                                src={qrPreviews.básico?.nequiQr || config.básico.nequiQr?.qrImageUrl || 'https://placehold.co/128x128.png?text=QR'} 
                                alt="Vista previa QR Nequi" 
                                width={128}
                                height={128}
                                className="w-32 h-32 mt-2 rounded-md border p-1" 
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <Label>Nombre del titular *</Label>
                            <Input
                                value={config.básico.nequiQr?.accountHolder || ''}
                                onChange={(e) => handleConfigChange(activePlan, 'nequiQr', { accountHolder: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Documento de identidad *</Label>
                            <Input
                                value={config.básico.nequiQr?.identityDocument || ''}
                                onChange={(e) => handleConfigChange(activePlan, 'nequiQr', { identityDocument: e.target.value })}
                            />
                        </div>
                    </div>
                </PaymentMethodCard>

                
                <PaymentMethodCard
                    title="Bancolombia con Código QR"
                    icon={<BancolombiaIcon className="h-8 w-8" />}
                    config={currentPlanConfig.bancolombiaQr}
                    onConfigChange={(newValues) => handleConfigChange(activePlan, 'bancolombiaQr', newValues)}
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-4">
                             <div>
                                <Label htmlFor={`bancolombia-qr-upload-${activePlan}`}>Imagen del Código QR (JPG/PNG, máx 5MB)</Label>
                                <Button asChild variant="outline" className="w-full mt-1">
                                    <label htmlFor={`bancolombia-qr-upload-${activePlan}`} className="cursor-pointer flex items-center gap-2">
                                        <UploadCloud className="h-4 w-4" />
                                        Seleccionar o cambiar QR
                                        <Input 
                                            id={`bancolombia-qr-upload-${activePlan}`}
                                            type="file" 
                                            className="hidden"
                                            accept="image/jpeg, image/png"
                                            onChange={(e) => handleQrImageSelection(e, activePlan, 'bancolombiaQr')} 
                                        />
                                    </label>
                                </Button>
                            </div>
                            <div>
                                <Label>Número de cuenta asociado *</Label>
                                <Input
                                    value={currentPlanConfig.bancolombiaQr?.accountNumber || ''}
                                    onChange={(e) => handleConfigChange(activePlan, 'bancolombiaQr', { accountNumber: e.target.value.replace(/\D/g, '') })}
                                    placeholder="1234567890"
                                />
                            </div>
                        </div>
                        <div className="text-center">
                            <Label>Vista Previa QR</Label>
                            <Image 
                                src={qrPreviews[activePlan]?.bancolombiaQr || currentPlanConfig.bancolombiaQr?.qrImageUrl || 'https://placehold.co/128x128.png?text=QR'} 
                                alt="Vista previa QR Bancolombia" 
                                width={128}
                                height={128}
                                className="w-32 h-32 mt-2 rounded-md border p-1" 
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <Label>Nombre del titular *</Label>
                            <Input
                                value={currentPlanConfig.bancolombiaQr?.accountHolder || ''}
                                onChange={(e) => handleConfigChange(activePlan, 'bancolombiaQr', { accountHolder: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Documento de identidad *</Label>
                            <Input
                                value={currentPlanConfig.bancolombiaQr?.identityDocument || ''}
                                onChange={(e) => handleConfigChange(activePlan, 'bancolombiaQr', { identityDocument: e.target.value })}
                            />
                        </div>
                    </div>
                </PaymentMethodCard>

                <PaymentMethodCard
                    title="Stripe"
                    icon={<CreditCard className="h-8 w-8 text-blue-600" />}
                    config={currentPlanConfig.stripe}
                    onConfigChange={(newValues) => handleConfigChange(activePlan, 'stripe', newValues)}
                >
                    <div>
                        <Label>Clave Pública (pk_...)</Label>
                        <Input value={currentPlanConfig.stripe?.publicKey || ''} onChange={(e) => handleConfigChange(activePlan, 'stripe', { publicKey: e.target.value })} />
                    </div>
                    <div>
                        <Label>Clave Secreta (sk_...)</Label>
                        <Input type="password" value={currentPlanConfig.stripe?.secretKey || ''} onChange={(e) => handleConfigChange(activePlan, 'stripe', { secretKey: e.target.value })} />
                    </div>
                    <div>
                        <Label>ID del Comercio (Opcional)</Label>
                        <Input value={currentPlanConfig.stripe?.merchantId || ''} onChange={(e) => handleConfigChange(activePlan, 'stripe', { merchantId: e.target.value })} />
                    </div>
                </PaymentMethodCard>

                 <PaymentMethodCard
                    title="Mercado Pago"
                    icon={<DollarSign className="h-8 w-8 text-sky-500" />}
                    config={currentPlanConfig.mercadoPago}
                    onConfigChange={(newValues) => handleConfigChange(activePlan, 'mercadoPago', newValues)}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Access Token</Label>
                            <Input type="password" value={currentPlanConfig.mercadoPago?.accessToken || ''} onChange={(e) => handleConfigChange(activePlan, 'mercadoPago', { accessToken: e.target.value })} />
                        </div>
                        <div>
                            <Label>Public Key</Label>
                            <Input value={currentPlanConfig.mercadoPago?.publicKey || ''} onChange={(e) => handleConfigChange(activePlan, 'mercadoPago', { publicKey: e.target.value })} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>País</Label>
                            <Select value={currentPlanConfig.mercadoPago?.country || 'CO'} onValueChange={(value) => handleConfigChange(activePlan, 'mercadoPago', { country: value })}>
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
                            <Select value={currentPlanConfig.mercadoPago?.mode || 'production'} onValueChange={(value) => handleConfigChange(activePlan, 'mercadoPago', { mode: value as any })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                                    <SelectItem value="production">Producción (Real)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </PaymentMethodCard>
            </div>
        </div>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? 'Guardando...' : `Guardar Configuración General`}
        </Button>
      </div>
    </div>
  );
}
