
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save, Edit, Trash2, XCircle, Clipboard, Globe, Share2, Facebook, Instagram, Twitter, MessageCircle, Loader2 } from "lucide-react";
import React, { useState, type ChangeEvent, useEffect } from "react";
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
import type { Company } from "@/types";
import { storageService } from "@/services/storage-service";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const RESTAURANT_ID = 'websapmax'; // Usamos ID fijo para el tenant principal

export default function AdminProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<Company>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para previsualización de imágenes
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // En un Saas real, el ID del restaurante vendría del usuario/sesión
  const companyId = RESTAURANT_ID;

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const docRef = doc(db, "companies", companyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Company;
          setProfileData(data);
          if(data.logoUrl) setLogoPreview(data.logoUrl);
          if(data.bannerUrl) setBannerPreview(data.bannerUrl);
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
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
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

  const handlePaymentMethodChange = (method: 'nequi' | 'daviplata' | 'bancolombia', field: string, value: string | boolean) => {
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


  const handleSave = async () => {
    setIsSaving(true);
    try {
        const docRef = doc(db, "companies", companyId);
        await setDoc(docRef, { ...profileData, id: companyId, updatedAt: serverTimestamp() }, { merge: true });
        
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
          <h1 className="text-3xl font-bold text-primary">Perfil del restaurante</h1>
          <p className="text-lg text-muted-foreground">Administra la información pública de tu restaurante.</p>
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
              <Label htmlFor="name">Nombre del restaurante</Label>
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
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={profileData.description || ''} rows={4} disabled={!isEditing} onChange={handleInputChange} />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <Label>Banner de Cabecera (1200x400 recomendado)</Label>
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
              <Button type="button" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => navigator.clipboard.writeText(profileData.socialLinks?.menuShareLink || '')}><Clipboard className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
