
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save, Edit, XCircle, Loader2 } from "lucide-react";
import React, { useState, type ChangeEvent, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";
import { storageService } from "@/services/storage-service";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSession } from "@/contexts/session-context";

export default function SuperAdminProfilePage() {
  const { toast } = useToast();
  const { currentUser } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const docRef = doc(db, "users", currentUser.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as User;
          setProfileData(data);
          if(data.avatarUrl) setAvatarPreview(data.avatarUrl);
        }
      } catch (error) {
        toast({ title: "Error", description: "No se pudo cargar tu perfil.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [currentUser, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file)); 
    setIsSaving(true);
    try {
      const url = await storageService.compressAndUploadFile(file, `avatars/${currentUser.id}/`);
      if (url) {
        setProfileData(p => ({...p, avatarUrl: url}));
        toast({
          title: "Avatar subido",
          description: "Tu nuevo avatar se ha cargado. Guarda los cambios para aplicarlo.",
        });
      }
    } catch (error: any) {
      toast({ title: "Error de Subida", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
        const docRef = doc(db, "users", currentUser.id);
        await setDoc(docRef, profileData, { merge: true });
        
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
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Perfil de Superadministrador</h1>
          <p className="text-lg text-muted-foreground">Administra tu información personal.</p>
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
        <CardHeader><CardTitle>Información Personal</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" value={profileData.firstName || ''} disabled={!isEditing} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" value={profileData.lastName || ''} disabled={!isEditing} onChange={handleInputChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" value={profileData.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Teléfono de contacto</Label>
            <Input id="contact" type="tel" value={profileData.contact || ''} disabled={!isEditing} onChange={handleInputChange} />
          </div>
           <div className="space-y-4">
              <Label>Avatar</Label>
              <div className="flex items-center gap-4">
                <Image src={avatarPreview || "https://placehold.co/100x100.png?text=SA"} alt="Avatar" width={96} height={96} className="h-24 w-24 rounded-full border object-cover" data-ai-hint="user avatar" />
                <Button variant="outline" asChild disabled={!isEditing}>
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <UploadCloud className="mr-2 h-4 w-4" /> Cambiar avatar
                    <Input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={!isEditing} />
                  </Label>
                </Button>
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    