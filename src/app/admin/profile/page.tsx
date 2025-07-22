"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save, Edit, Trash2, XCircle, CheckCircle, Clipboard, Globe, Share2, Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";
import { useState, type ChangeEvent } from "react";
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


// Mock data - in a real app, this would come from a backend/state management
const mockProfile = {
  name: "websapMax Restaurant",
  logoUrl: "https://placehold.co/150x150.png?text=Logo",
  address: "123 Foodie Lane, Flavor Town",
  phone: "+1 (555) 123-4567",
  email: "contact@websapmax.com",
  description: "The best place for delicious food!",
  primaryColor: "#FF4500",
  secondaryColor: "#FFF2E6",
  accentColor: "#FFB347",
  socialLinks: {
    website: "https://www.websapmax.com",
    menuShareLink: "https://menu.websapmax.com",
    facebook: "https://facebook.com/websapmax",
    instagram: "https://instagram.com/websapmax",
    x: "https://x.com/websapmax",
    whatsapp: "https://wa.me/15551234567",
    tiktok: "https://tiktok.com/@websapmax",
    pinterest: "https://pinterest.com/websapmax"
  },
  paymentMethods: {
    codEnabled: true,
    nequi: {
        enabled: true,
        qrCodeUrl: "https://placehold.co/200x200.png?text=Nequi+QR",
        accountHolder: "websapMax S.A.S",
        accountNumber: "3001234567",
    },
    daviplata: {
      enabled: false,
      qrCodeUrl: "",
      accountHolder: "",
      accountNumber: ""
    },
    bancolombia: {
      enabled: true,
      qrCodeUrl: "https://placehold.co/200x200.png?text=Bancolombia",
      accountHolder: "websapMax S.A.S",
      accountNumber: "123-456789-01",
    }
  }
};


export default function AdminProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [nequiQrPreview, setNequiQrPreview] = useState<string | null>(null);
  const [daviplataQrPreview, setDaviplataQrPreview] = useState<string | null>(null);
  const [bancolombiaQrPreview, setBancolombiaQrPreview] = useState<string | null>(null);
  const [isSaveAlertOpen, setIsSaveAlertOpen] = useState(false);


  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setter(null);
    }
  };

  const handleSave = () => {
    // Here you would typically send the data to your backend
    setIsSaveAlertOpen(true);
  };

  const handleConfirmSave = () => {
    setIsEditing(false);
    setIsSaveAlertOpen(false);
    // You can also reset image previews here if needed after save
  };

  const handleCancel = () => {
    // Reset any changed state if necessary
    setIsEditing(false);
    // Reset image previews
    setLogoPreview(null);
    setNequiQrPreview(null);
    setDaviplataQrPreview(null);
    setBancolombiaQrPreview(null);
    toast({
        title: "Edit Canceled",
        description: "Your changes have been discarded.",
        variant: "destructive"
    });
  };

  const handleDelete = () => {
    // In a real app, this would trigger a backend call to delete the profile
     toast({
        title: "Profile Deleted",
        description: "The restaurant profile has been permanently deleted.",
        variant: "destructive"
    });
    // You might want to redirect the user after deletion, e.g., router.push('/dashboard');
  }

  // Copiar enlace de menú al portapapeles de forma segura
  const handleCopyMenuLink = async () => {
    const link = mockProfile.socialLinks.menuShareLink;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        // Fallback para contextos inseguros
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
                    <Button variant="outline" onClick={handleCancel}><XCircle className="mr-2 h-4 w-4" /> Cancelar</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Guardar</Button>
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
              <Input id="restaurantName" defaultValue={mockProfile.name} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantPhone">Teléfono</Label>
              <Input id="restaurantPhone" type="tel" defaultValue={mockProfile.phone} disabled={!isEditing} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurantAddress">Dirección</Label>
            <Input id="restaurantAddress" defaultValue={mockProfile.address} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantEmail">Correo electrónico</Label>
            <Input id="restaurantEmail" type="email" defaultValue={mockProfile.email} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantDescription">Descripción</Label>
            <Textarea id="restaurantDescription" defaultValue={mockProfile.description} rows={4} disabled={!isEditing} />
          </div>
          
          <div className="space-y-4">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
                <Image 
                  src={logoPreview || mockProfile.logoUrl} 
                  alt="Logo del restaurante" 
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-md border object-cover" 
                  data-ai-hint="logo placeholder"
                />
                <Button variant="outline" asChild disabled={!isEditing}>
                  <Label htmlFor="logo-upload" className={`cursor-pointer ${!isEditing && 'cursor-not-allowed opacity-50'}`}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Subir logo
                    <Input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setLogoPreview)} disabled={!isEditing}/>
                  </Label>
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">Sugerencia: el logo debe ser cuadrado</p>
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
              <Input id="website" placeholder="Sitio web" defaultValue={mockProfile.socialLinks.website} className="pl-10" disabled={!isEditing}/>
            </div>
            <div className="relative">
              <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="menuShareLink" placeholder="Enlace del menú" defaultValue={mockProfile.socialLinks.menuShareLink} className="pl-10 pr-12" disabled={!isEditing}/>
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
              <Input id="facebook" placeholder="Facebook" defaultValue={mockProfile.socialLinks.facebook} className="pl-10" disabled={!isEditing}/>
            </div>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="instagram" placeholder="Instagram" defaultValue={mockProfile.socialLinks.instagram} className="pl-10" disabled={!isEditing}/>
            </div>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="x" placeholder="Twitter" defaultValue={mockProfile.socialLinks.x} className="pl-10" disabled={!isEditing}/>
            </div>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="whatsapp" placeholder="WhatsApp" defaultValue={mockProfile.socialLinks.whatsapp} className="pl-10" disabled={!isEditing}/>
            </div>
            <div className="relative">
              <TikTokIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="tiktok" placeholder="TikTok" defaultValue={mockProfile.socialLinks.tiktok} className="pl-10" disabled={!isEditing}/>
            </div>
            <div className="relative">
              <PinterestIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="pinterest" placeholder="Pinterest" defaultValue={mockProfile.socialLinks.pinterest} className="pl-10" disabled={!isEditing}/>
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
                    <Checkbox id="codEnabled" defaultChecked={mockProfile.paymentMethods.codEnabled} disabled={!isEditing} />
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
                    <Switch id="nequiEnabled" defaultChecked={mockProfile.paymentMethods.nequi.enabled} disabled={!isEditing} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="nequiAccountHolder">Titular de la cuenta</Label>
                    <Input id="nequiAccountHolder" defaultValue={mockProfile.paymentMethods.nequi.accountHolder} placeholder="Nombre del titular" disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nequiAccountNumber">Número de cuenta</Label>
                    <Input id="nequiAccountNumber" type="text" defaultValue={mockProfile.paymentMethods.nequi.accountNumber} placeholder="Número de celular" disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label>Código QR Nequi</Label>
                    <div className="flex items-center gap-4">
                        <Image 
                            src={nequiQrPreview || mockProfile.paymentMethods.nequi.qrCodeUrl || "https://placehold.co/100x100.png?text=Nequi"}
                            alt="Vista previa QR Nequi" 
                            width={100} 
                            height={100} 
                            className="rounded-md border object-cover"
                            data-ai-hint="QR code payment"
                        />
                        <Button variant="outline" asChild disabled={!isEditing}>
                            <Label htmlFor="nequiQrUpload" className={`cursor-pointer ${!isEditing && 'cursor-not-allowed opacity-50'}`}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                <Input id="nequiQrUpload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setNequiQrPreview)} disabled={!isEditing} />
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
                    <Switch id="daviplataEnabled" defaultChecked={mockProfile.paymentMethods.daviplata.enabled} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="daviplataAccountHolder">Titular de la cuenta</Label>
                    <Input id="daviplataAccountHolder" placeholder="Nombre del titular" defaultValue={mockProfile.paymentMethods.daviplata.accountHolder} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="daviplataAccountNumber">Número de cuenta</Label>
                    <Input id="daviplataAccountNumber" type="tel" placeholder="Número de celular" defaultValue={mockProfile.paymentMethods.daviplata.accountNumber} disabled={!isEditing}/>
                </div>
                <div className="space-y-2">
                    <Label>Código QR Daviplata</Label>
                    <div className="flex items-center gap-4">
                        <Image 
                            src={daviplataQrPreview || mockProfile.paymentMethods.daviplata.qrCodeUrl || "https://placehold.co/100x100.png?text=Daviplata"}
                            alt="Vista previa QR Daviplata" 
                            width={100} 
                            height={100} 
                            className="rounded-md border object-cover"
                            data-ai-hint="QR code payment"
                        />
                        <Button variant="outline" asChild disabled={!isEditing}>
                            <Label htmlFor="daviplataQrUpload" className={`cursor-pointer ${!isEditing && 'cursor-not-allowed opacity-50'}`}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                <Input id="daviplataQrUpload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setDaviplataQrPreview)} disabled={!isEditing} />
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
                    <Switch id="bancolombiaEnabled" defaultChecked={mockProfile.paymentMethods.bancolombia.enabled} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bancolombiaAccountHolder">Titular de la cuenta</Label>
                    <Input id="bancolombiaAccountHolder" defaultValue={mockProfile.paymentMethods.bancolombia.accountHolder} placeholder="Nombre del titular" disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bancolombiaAccountNumber">Número de cuenta</Label>
                    <Input id="bancolombiaAccountNumber" type="text" defaultValue={mockProfile.paymentMethods.bancolombia.accountNumber} placeholder="Número de cuenta" disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label>Código QR Bancolombia</Label>
                    <div className="flex items-center gap-4">
                        <Image 
                            src={bancolombiaQrPreview || mockProfile.paymentMethods.bancolombia.qrCodeUrl || "https://placehold.co/100x100.png?text=Bancolombia"}
                            alt="Vista previa QR Bancolombia" 
                            width={100} 
                            height={100} 
                            className="rounded-md border object-cover"
                            data-ai-hint="QR code payment"
                        />
                        <Button variant="outline" asChild disabled={!isEditing}>
                            <Label htmlFor="bancolombiaQrUpload" className={`cursor-pointer ${!isEditing && 'cursor-not-allowed opacity-50'}`}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                <Input id="bancolombiaQrUpload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setBancolombiaQrPreview)} disabled={!isEditing} />
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
                        <Input id="primaryColor" type="color" defaultValue={mockProfile.primaryColor} className="w-16 h-10 p-1" disabled={!isEditing} />
                        <Input type="text" defaultValue={mockProfile.primaryColor} readOnly className="flex-1" disabled={!isEditing} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color secundario</Label>
                     <div className="flex items-center gap-2">
                        <Input id="secondaryColor" type="color" defaultValue={mockProfile.secondaryColor} className="w-16 h-10 p-1" disabled={!isEditing} />
                        <Input type="text" defaultValue={mockProfile.secondaryColor} readOnly className="flex-1" disabled={!isEditing} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="accentColor">Color de acento</Label>
                    <div className="flex items-center gap-2">
                        <Input id="accentColor" type="color" defaultValue={mockProfile.accentColor} className="w-16 h-10 p-1" disabled={!isEditing} />
                        <Input type="text" defaultValue={mockProfile.accentColor} readOnly className="flex-1" disabled={!isEditing} />
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
      
      {/* Save Confirmation Dialog */}
      <AlertDialog open={isSaveAlertOpen} onOpenChange={setIsSaveAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex justify-center">
                   <CheckCircle className="h-16 w-16 text-green-500"/>
                </div>
                <AlertDialogTitle className="text-center text-xl">¡Perfil Guardado!</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                    Tus cambios en el perfil del restaurante han sido guardados exitosamente.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
                <AlertDialogAction onClick={handleConfirmSave}>
                    Aceptar
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
