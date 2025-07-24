
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save, Edit, Trash2, XCircle, CheckCircle, Clipboard, Globe, Share2, Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";
import { useState, type ChangeEvent, useEffect } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import NequiIcon from "@/components/icons/nequi-icon";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import TikTokIcon from "@/components/icons/tiktok-icon";
import PinterestIcon from "@/components/icons/pinterest-icon";
import DaviplataIcon from "@/components/icons/daviplata-icon";
import BancolombiaIcon from "@/components/icons/bancolombia-icon";
import type { RestaurantProfile } from "@/types";
import { mockRestaurantProfile } from "@/lib/mock-data";
import { storageService } from "@/services/storage-service";


export default function AdminProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState<RestaurantProfile>(mockRestaurantProfile);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [nequiQrFile, setNequiQrFile] = useState<File | null>(null);
  const [daviplataQrFile, setDaviplataQrFile] = useState<File | null>(null);
  const [bancolombiaQrFile, setBancolombiaQrFile] = useState<File | null>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(profileData.logoUrl);
  const [nequiQrPreview, setNequiQrPreview] = useState<string | null>(profileData.paymentMethods.nequi?.qrCodeUrl || null);
  const [daviplataQrPreview, setDaviplataQrPreview] = useState<string | null>(profileData.paymentMethods.daviplata?.qrCodeUrl || null);
  const [bancolombiaQrPreview, setBancolombiaQrPreview] = useState<string | null>(profileData.paymentMethods.bancolombia?.qrCodeUrl || null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({
        ...prev,
        socialLinks: {
            ...prev.socialLinks,
            [id]: value
        }
    }));
  };

  const handlePaymentMethodChange = (method: 'nequi' | 'daviplata' | 'bancolombia', field: string, value: string | boolean) => {
    setProfileData(prev => ({
        ...prev,
        paymentMethods: {
            ...prev.paymentMethods,
            [method]: {
                ...prev.paymentMethods[method],
                [field]: value
            }
        }
    }));
  };

  const handleCodChange = (checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      paymentMethods: { ...prev.paymentMethods, codEnabled: checked }
    }));
  };

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    setProfileData(prev => ({
        ...prev,
        corporateColors: {
            ...prev.corporateColors,
            [colorType]: value
        }
    }));
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validación de tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Archivo no válido",
          description: "Por favor, sube una imagen en formato JPG, PNG o WebP.",
          variant: "destructive",
        });
        return;
      }
      
      // Validación de tamaño (2MB)
      const maxSizeInBytes = 2 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        toast({
          title: "Archivo demasiado grande",
          description: "La imagen no debe exceder los 2MB.",
          variant: "destructive",
        });
        return;
      }

      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        let updatedData = { ...profileData };

        // Helper function to upload if file exists
        const uploadImage = async (file: File | null, path: string, currentUrl?: string): Promise<string | undefined> => {
            if (file) {
                // If there's an old URL and it's not a placeholder, try to delete it.
                if (currentUrl && !currentUrl.includes('placehold.co')) {
                    try {
                        await storageService.deleteFile(currentUrl);
                    } catch (deleteError) {
                        console.warn("Could not delete old file, continuing...", deleteError);
                    }
                }
                return await storageService.uploadFile(file, path);
            }
            return currentUrl; // Keep the old URL if no new file
        };

        const [logoUrl, nequiQrUrl, daviplataQrUrl, bancolombiaQrUrl] = await Promise.all([
            uploadImage(logoFile, `logos/${profileData.id}`),
            uploadImage(nequiQrFile, `qrs/${profileData.id}`, profileData.paymentMethods.nequi?.qrCodeUrl),
            uploadImage(daviplataQrFile, `qrs/${profileData.id}`, profileData.paymentMethods.daviplata?.qrCodeUrl),
            uploadImage(bancolombiaQrFile, `qrs/${profileData.id}`, profileData.paymentMethods.bancolombia?.qrCodeUrl),
        ]);

        updatedData.logoUrl = logoUrl || updatedData.logoUrl;
        if (updatedData.paymentMethods.nequi) updatedData.paymentMethods.nequi.qrCodeUrl = nequiQrUrl;
        if (updatedData.paymentMethods.daviplata) updatedData.paymentMethods.daviplata.qrCodeUrl = daviplataQrUrl;
        if (updatedData.paymentMethods.bancolombia) updatedData.paymentMethods.bancolombia.qrCodeUrl = bancolombiaQrUrl;

        const response = await fetch(`/api/companies/${profileData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile.');
        }

        const savedProfile = await response.json();
        setProfileData(savedProfile.data);
        setIsEditing(false);

        // Clear file inputs after successful save
        setLogoFile(null);
        setNequiQrFile(null);
        setDaviplataQrFile(null);
        setBancolombiaQrFile(null);

        toast({
            title: "¡Perfil Guardado!",
            description: "Tus cambios en el perfil del restaurante han sido guardados exitosamente.",
        });

    } catch (error: any) {
        console.error("Error saving profile:", error);
        toast({
            title: "Error al guardar",
            description: error.message || "No se pudieron guardar los cambios. Inténtalo de nuevo.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    
    setLogoPreview(profileData.logoUrl);
    setNequiQrPreview(profileData.paymentMethods.nequi?.qrCodeUrl || null);
    setDaviplataQrPreview(profileData.paymentMethods.daviplata?.qrCodeUrl || null);
    setBancolombiaQrPreview(profileData.paymentMethods.bancolombia?.qrCodeUrl || null);
    
    setLogoFile(null);
    setNequiQrFile(null);
    setDaviplataQrFile(null);
    setBancolombiaQrFile(null);
    
    toast({
        title: "Edición cancelada",
        description: "Tus cambios han sido descartados.",
        variant: "destructive"
    });
  };

  const handleDelete = () => {
     toast({
        title: "Profile Deleted",
        description: "The restaurant profile has been permanently deleted.",
        variant: "destructive"
    });
  }

  const handleCopyMenuLink = async () => {
    const link = profileData.socialLinks?.menuShareLink || "";
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast({
        title: '¡Enlace copiado!',
        description: 'El enlace del menú ha sido copiado al portapapeles.'
      });
    } catch (err) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el enlace.',
        variant: 'destructive'
      });
    }
  };
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Perfil del restaurante</h1>
          <p className="text-lg text-muted-foreground">Descripción del perfil del restaurante</p>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
            {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
            ) : (
                <>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}><XCircle className="mr-2 h-4 w-4" /> Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Guardando..." : <><Save className="mr-2 h-4 w-4" /> Guardar</>}
                    </Button>
                </>
            )}
            
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de que quieres eliminar este perfil?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu perfil de restaurante,
                            incluyendo todos los platos asociados, empleados y configuraciones.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Sí, eliminar perfil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del negocio</CardTitle>
          <CardDescription>Detalles básicos del negocio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Nombre del restaurante</Label>
              <Input id="name" value={profileData.name} disabled={!isEditing} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantPhone">Teléfono</Label>
              <Input id="phone" type="tel" value={profileData.phone} disabled={!isEditing} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurantAddress">Dirección</Label>
            <Input id="address" value={profileData.address} disabled={!isEditing} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantEmail">Correo electrónico</Label>
            <Input id="email" type="email" value={profileData.email} disabled={!isEditing} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantDescription">Descripción</Label>
            <Textarea id="description" value={profileData.description} rows={4} disabled={!isEditing} onChange={handleInputChange} />
          </div>
          
          <div className="space-y-4">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
                <Image 
                  src={logoPreview || "https://placehold.co/100x100.png?text=Logo"}
                  alt="Logo del restaurante" 
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-md border object-cover" 
                  data-ai-hint="logo placeholder"
                />
                <Button variant="outline" asChild disabled={!isEditing}>
                  <Label htmlFor="logo-upload" className={`cursor-pointer ${!isEditing && 'cursor-not-allowed opacity-50'}`}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Subir logo
                    <Input id="logo-upload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, setLogoFile, setLogoPreview)} disabled={!isEditing}/>
                  </Label>
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">Sugerencia: el logo debe ser cuadrado y menor a 2MB.</p>
          </div>
        </CardContent>
      </Card>
      
       {/* Social Links Card */}
      <Card>
        <CardHeader>
          <CardTitle>Enlaces de redes sociales</CardTitle>
          <CardDescription>Conéctate con tu audiencia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="website" placeholder="Sitio web" value={profileData.socialLinks?.website || ''} className="pl-10" disabled={!isEditing} onChange={handleSocialChange} />
            </div>
            <div className="relative">
              <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="menuShareLink" placeholder="Enlace del menú" value={profileData.socialLinks?.menuShareLink || ''} className="pl-10 pr-12" disabled={!isEditing} onChange={handleSocialChange} />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={handleCopyMenuLink}
                title="Copiar enlace"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="facebook" placeholder="Facebook" value={profileData.socialLinks?.facebook || ''} className="pl-10" disabled={!isEditing} onChange={handleSocialChange} />
            </div>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="instagram" placeholder="Instagram" value={profileData.socialLinks?.instagram || ''} className="pl-10" disabled={!isEditing} onChange={handleSocialChange} />
            </div>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="x" placeholder="Twitter" value={profileData.socialLinks?.x || ''} className="pl-10" disabled={!isEditing} onChange={handleSocialChange} />
            </div>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="whatsapp" placeholder="WhatsApp" value={profileData.socialLinks?.whatsapp || ''} className="pl-10" disabled={!isEditing} onChange={handleSocialChange} />
            </div>
            <div className="relative">
              <TikTokIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="tiktok" placeholder="TikTok" value={profileData.socialLinks?.tiktok || ''} className="pl-10" disabled={!isEditing} onChange={handleSocialChange} />
            </div>
            <div className="relative">
              <PinterestIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="pinterest" placeholder="Pinterest" value={profileData.socialLinks?.pinterest || ''} className="pl-10" disabled={!isEditing} onChange={handleSocialChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pago</CardTitle>
          <CardDescription>Configura las formas de pago que aceptas en tu restaurante.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {/* Contra Entrega */}
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                    <Checkbox id="codEnabled" checked={profileData.paymentMethods.codEnabled} onCheckedChange={handleCodChange} disabled={!isEditing} />
                    <Label htmlFor="codEnabled" className={`text-lg font-semibold leading-none ${!isEditing && 'text-muted-foreground'}`}>
                        Pago Contra Entrega
                    </Label>
                </div>
                <p className="text-sm text-muted-foreground">Permite a los clientes pagar en efectivo al recibir su pedido.</p>
            </div>
            
            {/* Nequi */}
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <NequiIcon className="h-6 w-6" />
                        <Label htmlFor="nequiEnabled" className={`text-lg font-semibold ${!isEditing && 'text-muted-foreground'}`}>Nequi</Label>
                    </div>
                    <Switch id="nequiEnabled" checked={profileData.paymentMethods.nequi?.enabled} onCheckedChange={(checked) => handlePaymentMethodChange('nequi', 'enabled', checked)} disabled={!isEditing} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="nequiAccountHolder">Titular de la cuenta</Label>
                    <Input id="nequiAccountHolder" value={profileData.paymentMethods.nequi?.accountHolder} placeholder="Nombre del titular" disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('nequi', 'accountHolder', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nequiAccountNumber">Número de cuenta</Label>
                    <Input id="nequiAccountNumber" type="text" value={profileData.paymentMethods.nequi?.accountNumber} placeholder="Número de celular" disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('nequi', 'accountNumber', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Código QR Nequi</Label>
                    <div className="flex items-center gap-4">
                        <Image 
                            src={nequiQrPreview || "https://placehold.co/100x100.png?text=Nequi"}
                            alt="Vista previa QR Nequi" 
                            width={100} 
                            height={100} 
                            className="rounded-md border object-cover"
                            data-ai-hint="QR code payment"
                        />
                        <Button variant="outline" asChild disabled={!isEditing}>
                            <Label htmlFor="nequiQrUpload" className={`cursor-pointer ${!isEditing && 'cursor-not-allowed opacity-50'}`}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                <Input id="nequiQrUpload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, setNequiQrFile, setNequiQrPreview)} disabled={!isEditing} />
                            </Label>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Daviplata */}
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DaviplataIcon className="h-6 w-6" />
                        <Label htmlFor="daviplataEnabled" className={`text-lg font-semibold ${!isEditing && 'text-muted-foreground'}`}>Daviplata</Label>
                    </div>
                    <Switch id="daviplataEnabled" checked={profileData.paymentMethods.daviplata?.enabled} onCheckedChange={(checked) => handlePaymentMethodChange('daviplata', 'enabled', checked)} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="daviplataAccountHolder">Titular de la cuenta</Label>
                    <Input id="daviplataAccountHolder" placeholder="Nombre del titular" value={profileData.paymentMethods.daviplata?.accountHolder} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('daviplata', 'accountHolder', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="daviplataAccountNumber">Número de cuenta</Label>
                    <Input id="daviplataAccountNumber" type="tel" placeholder="Número de celular" value={profileData.paymentMethods.daviplata?.accountNumber} disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('daviplata', 'accountNumber', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Código QR Daviplata</Label>
                    <div className="flex items-center gap-4">
                        <Image 
                            src={daviplataQrPreview || "https://placehold.co/100x100.png?text=Daviplata"}
                            alt="Vista previa QR Daviplata" 
                            width={100} 
                            height={100} 
                            className="rounded-md border object-cover"
                            data-ai-hint="QR code payment"
                        />
                        <Button variant="outline" asChild disabled={!isEditing}>
                            <Label htmlFor="daviplataQrUpload" className={`cursor-pointer ${!isEditing && 'cursor-not-allowed opacity-50'}`}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                <Input id="daviplataQrUpload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, setDaviplataQrFile, setDaviplataQrPreview)} disabled={!isEditing} />
                            </Label>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bancolombia */}
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BancolombiaIcon className="h-6 w-6" />
                        <Label htmlFor="bancolombiaEnabled" className={`text-lg font-semibold ${!isEditing && 'text-muted-foreground'}`}>QR Bancolombia</Label>
                    </div>
                    <Switch id="bancolombiaEnabled" checked={profileData.paymentMethods.bancolombia?.enabled} onCheckedChange={(checked) => handlePaymentMethodChange('bancolombia', 'enabled', checked)} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bancolombiaAccountHolder">Titular de la cuenta</Label>
                    <Input id="bancolombiaAccountHolder" value={profileData.paymentMethods.bancolombia?.accountHolder} placeholder="Nombre del titular" disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('bancolombia', 'accountHolder', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bancolombiaAccountNumber">Número de cuenta</Label>
                    <Input id="bancolombiaAccountNumber" type="text" value={profileData.paymentMethods.bancolombia?.accountNumber} placeholder="Número de cuenta" disabled={!isEditing} onChange={(e) => handlePaymentMethodChange('bancolombia', 'accountNumber', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Código QR Bancolombia</Label>
                    <div className="flex items-center gap-4">
                        <Image 
                            src={bancolombiaQrPreview || "https://placehold.co/100x100.png?text=Bancolombia"}
                            alt="Vista previa QR Bancolombia" 
                            width={100} 
                            height={100} 
                            className="rounded-md border object-cover"
                            data-ai-hint="QR code payment"
                        />
                        <Button variant="outline" asChild disabled={!isEditing}>
                            <Label htmlFor="bancolombiaQrUpload" className={`cursor-pointer ${!isEditing && 'cursor-not-allowed opacity-50'}`}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                <Input id="bancolombiaQrUpload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, setBancolombiaQrFile, setBancolombiaQrPreview)} disabled={!isEditing} />
                            </Label>
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Colores</CardTitle>
          <CardDescription>Configura los colores del restaurante</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="primaryColor">Color primario</Label>
                    <div className="flex items-center gap-2">
                        <Input id="primary" type="color" value={profileData.corporateColors.primary} className="w-16 h-10 p-1" disabled={!isEditing} onChange={(e) => handleColorChange('primary', e.target.value)} />
                        <Input type="text" value={profileData.corporateColors.primary} readOnly className="flex-1" disabled />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color secundario</Label>
                     <div className="flex items-center gap-2">
                        <Input id="secondary" type="color" value={profileData.corporateColors.secondary} className="w-16 h-10 p-1" disabled={!isEditing} onChange={(e) => handleColorChange('secondary', e.target.value)} />
                        <Input type="text" value={profileData.corporateColors.secondary} readOnly className="flex-1" disabled />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="accentColor">Color de acento</Label>
                    <div className="flex items-center gap-2">
                        <Input id="accent" type="color" value={profileData.corporateColors.accent} className="w-16 h-10 p-1" disabled={!isEditing} onChange={(e) => handleColorChange('accent', e.target.value)} />
                        <Input type="text" value={profileData.corporateColors.accent} readOnly className="flex-1" disabled />
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    