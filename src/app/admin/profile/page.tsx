
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save, Edit, Trash2, XCircle, Clipboard, Globe, Share2, Facebook, Instagram, Twitter, MessageCircle, Loader2, CreditCard, Music, MessageSquare as MessageSquareIcon, Truck } from "lucide-react";
import React, { useState, type ChangeEvent, useEffect } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import NequiIcon from "@/components/icons/nequi-icon";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import DaviplataIcon from "@/components/icons/daviplata-icon";
import BancolombiaIcon from "@/components/icons/bancolombia-icon";
import MercadoPagoIcon from "@/components/icons/mercadopago-icon";
import type { Company } from "@/types";
import { storageService } from "@/services/storage-service";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useSession } from "@/contexts/session-context";

export default function AdminProfilePage() {
  const { toast } = useToast();
  const { currentUser } = useSession();
  const companyId = currentUser?.companyId;

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<Company>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [nequiQrPreview, setNequiQrPreview] = useState<string | null>(null);
  const [daviplataQrPreview, setDaviplataQrPreview] = useState<string | null>(null);
  const [bancolombiaQrPreview, setBancolombiaQrPreview] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchProfile() {
      if (!companyId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const db = getDb();
        const docRef = doc(db, "companies", companyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Company;
          setProfileData(data);
          if(data.logoUrl) setLogoPreview(data.logoUrl);
          if(data.bannerUrl) setBannerPreview(data.bannerUrl);
          if(data.paymentMethods?.nequi?.nequiQrImageUrl) setNequiQrPreview(data.paymentMethods.nequi.nequiQrImageUrl);
          if(data.paymentMethods?.daviplata?.daviplataQrImageUrl) setDaviplataQrPreview(data.paymentMethods.daviplata.daviplataQrImageUrl);
          if(data.paymentMethods?.bancolombia?.bancolombiaQrImageUrl) setBancolombiaQrPreview(data.paymentMethods.bancolombia.bancolombiaQrImageUrl);
        } else {
          console.log("No such document! Creating a default profile structure.");
          setProfileData({ id: companyId, name: "Mi Restaurante" }); // Estado inicial mínimo
        }
      } catch (error) {
        toast({ title: "Error", description: "No se pudo cargar el perfil.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [companyId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    // Si el input es de tipo 'number', convierte el valor a número
    const finalValue = (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) : value;
    setProfileData(prev => ({ ...prev, [id]: finalValue }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({
        ...prev,
        socialLinks: {
            ...(prev.socialLinks || {}),
            [id]: value
        }
    }));
  };

  const handlePaymentMethodChange = (method: 'nequi' | 'daviplata' | 'bancolombia' | 'mercadoPago' | 'stripe', field: string, value: string | boolean) => {
    setProfileData(prev => ({
        ...prev,
        paymentMethods: {
            ...(prev.paymentMethods || {}),
            [method]: {
                ...(prev.paymentMethods?.[method] || { enabled: false }),
                [field]: value
            }
        }
    }));
  };

  const handleCodChange = (checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      paymentMethods: { ...prev.paymentMethods, codEnabled: checked } as any
    }));
  };

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    setProfileData(prev => ({
        ...prev,
        corporateColors: {
            ...(prev.corporateColors || {}),
            [colorType]: value
        } as any
    }));
  };

 const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>,
    updateProfileField: (url: string) => void
  ) => {
    if (!companyId) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file)); // Vista previa local
    setIsSaving(true);
    try {
      const url = await storageService.compressAndUploadFile(file, `profiles/${companyId}/`);
      if (url) {
        updateProfileField(url); // Actualizar el estado del perfil con la nueva URL
        toast({
          title: "Imagen subida",
          description: "La nueva imagen se ha cargado. Guarda los cambios para aplicarla.",
        });
      }
    } catch (error: any) {
      toast({ title: "Error de Subida", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQrImageUpload = async (event: ChangeEvent<HTMLInputElement>, method: 'nequi' | 'bancolombia' | 'daviplata') => {
    if (!companyId) return;
    const file = event.target.files?.[0];
    if (!file) return;

    let setPreview, fieldName;
    switch(method) {
        case 'nequi':
            setPreview = setNequiQrPreview;
            fieldName = 'nequiQrImageUrl';
            break;
        case 'bancolombia':
            setPreview = setBancolombiaQrPreview;
            fieldName = 'bancolombiaQrImageUrl';
            break;
        case 'daviplata':
            setPreview = setDaviplataQrPreview;
            fieldName = 'daviplataQrImageUrl';
            break;
    }

    setPreview(URL.createObjectURL(file));
    setIsSaving(true);
    try {
      const url = await storageService.compressAndUploadFile(file, `qrs/${companyId}/`);
      if (url) {
        handlePaymentMethodChange(method, fieldName, url);
        toast({
          title: "Imagen QR subida",
          description: "El nuevo QR se ha cargado. Guarda los cambios para aplicarlo.",
        });
      }
    } catch (error: any) {
       toast({ title: "Error de Subida", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!companyId) return;
    setIsSaving(true);
    try {
        const db = getDb();
        const docRef = doc(db, "companies", companyId);
        await setDoc(docRef, { ...profileData, id: companyId, updatedAt: new Date().toISOString() }, { merge: true });
        
        setIsEditing(false);
        toast({ title: "¡Perfil Guardado!", description: "Tus cambios han sido guardados exitosamente." });
    } catch (error: any) {
        toast({ title: "Error al Guardar", description: "No se pudieron guardar los cambios.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
            <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Mi Perfil</h1>
          <p className="text-lg text-muted-foreground">Administra la información pública de tu negocio.</p>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
            {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
            ) : (
                <>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}><XCircle className="mr-2 h-4 w-4" /> Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                      {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Información del negocio</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del negocio</Label>
              <Input id="name" value={profileData.name || ''} disabled={!isEditing} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" value={profileData.phone || ''} disabled={!isEditing} onChange={handleInputChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressStreet">Dirección</Label>
            <Input id="addressStreet" value={profileData.addressStreet || ''} disabled={!isEditing} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" value={profileData.email || ''} disabled={!isEditing} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
                <Label htmlFor="baseShippingCost">Costo de Envío Base</Label>
                <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="baseShippingCost" type="number" step="0.01" value={profileData.baseShippingCost || 0} disabled={!isEditing} onChange={handleInputChange} className="pl-10" />
                </div>
            </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={profileData.description || ''} rows={4} disabled={!isEditing} onChange={handleInputChange} />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Label>Avatar</Label>
              <div className="flex items-center gap-4">
                <Image src={currentUser?.avatarUrl || "https://placehold.co/100x100.png?text=Avatar"} alt="Avatar" width={96} height={96} className="h-24 w-24 rounded-full border object-cover" data-ai-hint="user avatar" />
                <Button variant="outline" asChild disabled={!isEditing}>
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <UploadCloud className="mr-2 h-4 w-4" /> Subir Avatar
                    <Input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setBannerPreview, (url) => setProfileData(p => ({...p, bannerUrl: url})))} disabled={!isEditing} />
                  </Label>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <Image src={logoPreview || "https://placehold.co/100x100.png?text=Logo"} alt="Logo" width={96} height={96} className="h-24 w-24 rounded-md border object-cover" data-ai-hint="logo placeholder" />
                <Button variant="outline" asChild disabled={!isEditing}>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <UploadCloud className="mr-2 h-4 w-4" /> Subir logo
                    <Input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setLogoPreview, (url) => setProfileData(p => ({...p, logoUrl: url})))} disabled={!isEditing} />
                  </Label>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <Label>Banner de Cabecera</Label>
              <div className="flex items-center gap-4">
                <Image src={bannerPreview || "https://placehold.co/200x100.png?text=Banner"} alt="Banner" width={192} height={96} className="h-24 w-48 rounded-md border object-cover" data-ai-hint="restaurant banner" />
                <Button variant="outline" asChild disabled={!isEditing}>
                  <Label htmlFor="banner-upload" className="cursor-pointer">
                    <UploadCloud className="mr-2 h-4 w-4" /> Subir banner
                    <Input id="banner-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setBannerPreview, (url) => setProfileData(p => ({...p, bannerUrl: url})))} disabled={!isEditing} />
                  </Label>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
       {/* Social Links Card */}
      <Card>
        <CardHeader><CardTitle>Enlaces de redes sociales</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="website" placeholder="Sitio web" value={profileData.socialLinks?.website || ''} className="pl-10" disabled={!isEditing} onChange={handleSocialChange} />
            </div>
            <div className="relative">
              <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="menuShareLink" placeholder="Enlace del menú" value={profileData.socialLinks?.menuShareLink || ''} className="pl-10 pr-12" disabled={!isEditing} onChange={handleSocialChange} />
              <Button type="button" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => navigator.clipboard.writeText(profileData.socialLinks?.menuShareLink || '')} disabled={!profileData.socialLinks?.menuShareLink}><Clipboard className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Card */}
      <Card>
        <CardHeader><CardTitle>Opciones de Pago Disponibles</CardTitle></CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="codEnabled" 
                    checked={profileData.paymentMethods?.codEnabled || false} 
                    onCheckedChange={handleCodChange}
                    disabled={!isEditing}
                />
                <Label htmlFor="codEnabled">Habilitar pago contra entrega</Label>
            </div>

            {/* Nequi */}
            <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <NequiIcon className="h-6 w-6"/>
                        <Label htmlFor="nequiEnabled" className="font-semibold">Nequi</Label>
                    </div>
                    <Switch 
                        id="nequiEnabled" 
                        checked={profileData.paymentMethods?.nequi?.enabled || false}
                        onCheckedChange={(checked) => handlePaymentMethodChange('nequi', 'enabled', checked)}
                        disabled={!isEditing}
                    />
                </div>
                {profileData.paymentMethods?.nequi?.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                            <Label htmlFor="nequiAccountHolder">Titular</Label>
                            <Input id="nequiAccountHolder" value={profileData.paymentMethods?.nequi?.accountHolder || ''} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('nequi', 'accountHolder', e.target.value)} />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="nequiAccountNumber">Número de cuenta</Label>
                            <Input id="nequiAccountNumber" value={profileData.paymentMethods?.nequi?.accountNumber || ''} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('nequi', 'accountNumber', e.target.value)} />
                        </div>
                        <div className="space-y-1 col-span-2">
                            <Label>Imagen del Código QR</Label>
                            <div className="flex items-center gap-4 mt-1">
                                <Image src={nequiQrPreview || "https://placehold.co/100x100.png?text=QR"} alt="QR Nequi" width={96} height={96} className="h-24 w-24 rounded-md border object-cover" data-ai-hint="payment QR code"/>
                                <Button variant="outline" asChild disabled={!isEditing}>
                                    <Label htmlFor="nequi-qr-upload" className="cursor-pointer">
                                        <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                        <Input id="nequi-qr-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleQrImageUpload(e, 'nequi')} disabled={!isEditing} />
                                    </Label>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Daviplata */}
            <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DaviplataIcon className="h-6 w-6"/>
                        <Label htmlFor="daviplataEnabled" className="font-semibold">Daviplata</Label>
                    </div>
                    <Switch 
                        id="daviplataEnabled" 
                        checked={profileData.paymentMethods?.daviplata?.enabled || false}
                        onCheckedChange={(checked) => handlePaymentMethodChange('daviplata', 'enabled', checked)}
                        disabled={!isEditing}
                    />
                </div>
                {profileData.paymentMethods?.daviplata?.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                            <Label htmlFor="daviplataAccountHolder">Titular</Label>
                            <Input id="daviplataAccountHolder" value={profileData.paymentMethods?.daviplata?.accountHolder || ''} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('daviplata', 'accountHolder', e.target.value)} />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="daviplataAccountNumber">Número de cuenta</Label>
                            <Input id="daviplataAccountNumber" value={profileData.paymentMethods?.daviplata?.accountNumber || ''} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('daviplata', 'accountNumber', e.target.value)} />
                        </div>
                        <div className="space-y-1 col-span-2">
                            <Label>Imagen del Código QR</Label>
                            <div className="flex items-center gap-4 mt-1">
                                <Image src={daviplataQrPreview || "https://placehold.co/100x100.png?text=QR"} alt="QR Daviplata" width={96} height={96} className="h-24 w-24 rounded-md border object-cover" data-ai-hint="payment QR code"/>
                                <Button variant="outline" asChild disabled={!isEditing}>
                                    <Label htmlFor="daviplata-qr-upload" className="cursor-pointer">
                                        <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                        <Input id="daviplata-qr-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleQrImageUpload(e, 'daviplata')} disabled={!isEditing} />
                                    </Label>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bancolombia */}
            <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BancolombiaIcon className="h-6 w-6"/>
                        <Label htmlFor="bancolombiaEnabled" className="font-semibold">Bancolombia</Label>
                    </div>
                    <Switch 
                        id="bancolombiaEnabled" 
                        checked={profileData.paymentMethods?.bancolombia?.enabled || false}
                        onCheckedChange={(checked) => handlePaymentMethodChange('bancolombia', 'enabled', checked)}
                        disabled={!isEditing}
                    />
                </div>
                {profileData.paymentMethods?.bancolombia?.enabled && (
                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="bancolombiaAccountHolder">Titular</Label>
                                <Input id="bancolombiaAccountHolder" value={profileData.paymentMethods?.bancolombia?.accountHolder || ''} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('bancolombia', 'accountHolder', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="bancolombiaAccountNumber">Número de cuenta</Label>
                                <Input id="bancolombiaAccountNumber" value={profileData.paymentMethods?.bancolombia?.accountNumber || ''} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('bancolombia', 'accountNumber', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Imagen del Código QR</Label>
                            <div className="flex items-center gap-4 mt-1">
                                <Image src={bancolombiaQrPreview || "https://placehold.co/100x100.png?text=QR"} alt="QR Bancolombia" width={96} height={96} className="h-24 w-24 rounded-md border object-cover" data-ai-hint="payment QR code"/>
                                <Button variant="outline" asChild disabled={!isEditing}>
                                    <Label htmlFor="bancolombia-qr-upload" className="cursor-pointer">
                                        <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                        <Input id="bancolombia-qr-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleQrImageUpload(e, 'bancolombia')} disabled={!isEditing} />
                                    </Label>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* MercadoPago */}
            <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MercadoPagoIcon className="h-6 w-6"/>
                        <Label htmlFor="mercadoPagoEnabled" className="font-semibold">Mercado Pago</Label>
                    </div>
                    <Switch 
                        id="mercadoPagoEnabled" 
                        checked={profileData.paymentMethods?.mercadoPago?.enabled || false}
                        onCheckedChange={(checked) => handlePaymentMethodChange('mercadoPago', 'enabled', checked)}
                        disabled={!isEditing}
                    />
                </div>
                {profileData.paymentMethods?.mercadoPago?.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                            <Label htmlFor="mercadoPagoPublicKey">Public Key</Label>
                            <Input id="mercadoPagoPublicKey" value={profileData.paymentMethods?.mercadoPago?.publicKey || ''} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('mercadoPago', 'publicKey', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="mercadoPagoAccessToken">Access Token</Label>
                            <Input id="mercadoPagoAccessToken" type="password" value={profileData.paymentMethods?.mercadoPago?.accessToken || ''} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('mercadoPago', 'accessToken', e.target.value)} />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Stripe */}
            <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-6 w-6"/>
                        <Label htmlFor="stripeEnabled" className="font-semibold">Stripe</Label>
                    </div>
                    <Switch 
                        id="stripeEnabled" 
                        checked={profileData.paymentMethods?.stripe?.enabled || false}
                        onCheckedChange={(checked) => handlePaymentMethodChange('stripe', 'enabled', checked)}
                        disabled={!isEditing}
                    />
                </div>
                {profileData.paymentMethods?.stripe?.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                            <Label htmlFor="stripePublicKey">Public Key</Label>
                            <Input id="stripePublicKey" placeholder="pk_test_..." value={profileData.paymentMethods?.stripe?.publicKey || ''} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('stripe', 'publicKey', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="stripeSecretKey">Secret Key</Label>
                            <Input id="stripeSecretKey" type="password" placeholder="sk_test_..." value={profileData.paymentMethods?.stripe?.secretKey || ''} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('stripe', 'secretKey', e.target.value)} />
                        </div>
                    </div>
                )}
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
