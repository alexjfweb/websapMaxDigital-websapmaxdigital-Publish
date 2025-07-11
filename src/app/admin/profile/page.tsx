
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context"; 
import TikTokIcon from "@/components/icons/tiktok-icon";
import PinterestIcon from "@/components/icons/pinterest-icon";
import DaviplataIcon from "@/components/icons/daviplata-icon";
import BancolombiaIcon from "@/components/icons/bancolombia-icon";
import { Globe, Share2, Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";


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
  const { t } = useLanguage();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [nequiQrPreview, setNequiQrPreview] = useState<string | null>(null);
  const [daviplataQrPreview, setDaviplataQrPreview] = useState<string | null>(null);
  const [bancolombiaQrPreview, setBancolombiaQrPreview] = useState<string | null>(null);

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


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('adminProfile.title')}</h1>
      <p className="text-lg text-muted-foreground">{t('adminProfile.description')}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminProfile.businessInfoCard.title')}</CardTitle>
          <CardDescription>{t('adminProfile.businessInfoCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">{t('adminProfile.businessInfoCard.nameLabel')}</Label>
              <Input id="restaurantName" defaultValue={mockProfile.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantPhone">{t('adminProfile.businessInfoCard.phoneLabel')}</Label>
              <Input id="restaurantPhone" type="tel" defaultValue={mockProfile.phone} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurantAddress">{t('adminProfile.businessInfoCard.addressLabel')}</Label>
            <Input id="restaurantAddress" defaultValue={mockProfile.address} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantEmail">{t('adminProfile.businessInfoCard.emailLabel')}</Label>
            <Input id="restaurantEmail" type="email" defaultValue={mockProfile.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantDescription">{t('adminProfile.businessInfoCard.descriptionLabel')}</Label>
            <Textarea id="restaurantDescription" defaultValue={mockProfile.description} rows={4} />
          </div>
          
          <div className="space-y-4">
            <Label>{t('adminProfile.businessInfoCard.logoLabel')}</Label>
            <div className="flex items-center gap-4">
                <Image 
                  src={logoPreview || mockProfile.logoUrl} 
                  alt={t('adminProfile.businessInfoCard.logoAlt')} 
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-md border object-cover" 
                  data-ai-hint="logo placeholder"
                />
                <Button variant="outline" asChild>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <UploadCloud className="mr-2 h-4 w-4" /> {t('adminProfile.businessInfoCard.uploadLogoButton')}
                  </Label>
                </Button>
                <Input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setLogoPreview)}/>
            </div>
            <p className="text-xs text-muted-foreground">{t('adminProfile.businessInfoCard.logoHint')}</p>
          </div>
        </CardContent>
      </Card>
      
       {/* Social Links Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('adminProfile.socialLinksCard.title')}</CardTitle>
          <CardDescription>{t('adminProfile.socialLinksCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="website" placeholder={t('adminProfile.socialLinksCard.websitePlaceholder')} defaultValue={mockProfile.socialLinks.website} className="pl-10" />
            </div>
            <div className="relative">
              <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="menuShareLink" placeholder={t('adminProfile.socialLinksCard.menuShareLinkPlaceholder')} defaultValue={mockProfile.socialLinks.menuShareLink} className="pl-10" />
            </div>
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="facebook" placeholder={t('adminProfile.socialLinksCard.facebookPlaceholder')} defaultValue={mockProfile.socialLinks.facebook} className="pl-10" />
            </div>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="instagram" placeholder={t('adminProfile.socialLinksCard.instagramPlaceholder')} defaultValue={mockProfile.socialLinks.instagram} className="pl-10" />
            </div>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="x" placeholder={t('adminProfile.socialLinksCard.xPlaceholder')} defaultValue={mockProfile.socialLinks.x} className="pl-10" />
            </div>
             <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="whatsapp" placeholder={t('adminProfile.socialLinksCard.whatsappPlaceholder')} defaultValue={mockProfile.socialLinks.whatsapp} className="pl-10" />
            </div>
            <div className="relative">
              <TikTokIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="tiktok" placeholder={t('adminProfile.socialLinksCard.tiktokPlaceholder')} defaultValue={mockProfile.socialLinks.tiktok} className="pl-10" />
            </div>
            <div className="relative">
              <PinterestIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="pinterest" placeholder={t('adminProfile.socialLinksCard.pinterestPlaceholder')} defaultValue={mockProfile.socialLinks.pinterest} className="pl-10" />
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
                    <Checkbox id="codEnabled" defaultChecked={mockProfile.paymentMethods.codEnabled} />
                    <Label htmlFor="codEnabled" className="text-lg font-semibold leading-none">
                        Pago Contra Entrega
                    </Label>
                </div>
                <p className="text-sm text-muted-foreground">Permite a los clientes pagar en efectivo al recibir su pedido.</p>
            </div>

            {/* Daviplata */}
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DaviplataIcon className="h-6 w-6" />
                        <Label htmlFor="daviplataEnabled" className="text-lg font-semibold">Daviplata</Label>
                    </div>
                    <Switch id="daviplataEnabled" defaultChecked={mockProfile.paymentMethods.daviplata.enabled} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="daviplataAccountHolder">Titular de la cuenta</Label>
                    <Input id="daviplataAccountHolder" placeholder="Nombre del titular" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="daviplataAccountNumber">Número de cuenta</Label>
                    <Input id="daviplataAccountNumber" type="tel" placeholder="Número de celular" />
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
                        <Button variant="outline" asChild>
                            <Label htmlFor="daviplataQrUpload" className="cursor-pointer">
                                <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                <Input id="daviplataQrUpload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setDaviplataQrPreview)} />
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
                        <Label htmlFor="bancolombiaEnabled" className="text-lg font-semibold">QR Bancolombia</Label>
                    </div>
                    <Switch id="bancolombiaEnabled" defaultChecked={mockProfile.paymentMethods.bancolombia.enabled} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bancolombiaAccountHolder">Titular de la cuenta</Label>
                    <Input id="bancolombiaAccountHolder" defaultValue={mockProfile.paymentMethods.bancolombia.accountHolder} placeholder="Nombre del titular" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bancolombiaAccountNumber">Número de cuenta</Label>
                    <Input id="bancolombiaAccountNumber" type="text" defaultValue={mockProfile.paymentMethods.bancolombia.accountNumber} placeholder="Número de cuenta" />
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
                        <Button variant="outline" asChild>
                            <Label htmlFor="bancolombiaQrUpload" className="cursor-pointer">
                                <UploadCloud className="mr-2 h-4 w-4" /> Subir QR
                                <Input id="bancolombiaQrUpload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setBancolombiaQrPreview)} />
                            </Label>
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>{t('adminProfile.brandingCard.title')}</CardTitle>
          <CardDescription>{t('adminProfile.brandingCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="primaryColor">{t('adminProfile.brandingCard.primaryColorLabel')}</Label>
                    <div className="flex items-center gap-2">
                        <Input id="primaryColor" type="color" defaultValue={mockProfile.primaryColor} className="w-16 h-10 p-1" />
                        <Input type="text" defaultValue={mockProfile.primaryColor} readOnly className="flex-1" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="secondaryColor">{t('adminProfile.brandingCard.backgroundColorLabel')}</Label>
                     <div className="flex items-center gap-2">
                        <Input id="secondaryColor" type="color" defaultValue={mockProfile.secondaryColor} className="w-16 h-10 p-1" />
                        <Input type="text" defaultValue={mockProfile.secondaryColor} readOnly className="flex-1" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="accentColor">{t('adminProfile.brandingCard.accentColorLabel')}</Label>
                    <div className="flex items-center gap-2">
                        <Input id="accentColor" type="color" defaultValue={mockProfile.accentColor} className="w-16 h-10 p-1" />
                        <Input type="text" defaultValue={mockProfile.accentColor} readOnly className="flex-1" />
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> {t('adminProfile.editButton')}</Button>
        <Button><Save className="mr-2 h-4 w-4" /> {t('adminProfile.saveButton')}</Button>
        <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> {t('adminProfile.deleteButton')}</Button>
      </div>
    </div>
  );
}
