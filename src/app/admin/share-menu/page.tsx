
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, Save, UploadCloud, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WhatsAppIcon from "@/components/icons/whatsapp-icon";
import React, { useEffect, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useSession } from "@/contexts/session-context";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { storageService } from "@/services/storage-service";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import SuccessModal from "@/components/ui/success-modal";

export default function AdminShareMenuPage() {
  const { toast } = useToast();
  const { currentUser } = useSession();
  const companyId = currentUser.companyId;

  const [menuUrl, setMenuUrl] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && companyId) {
      setMenuUrl(`${window.location.origin}/menu/${companyId}`);
    }
    
    async function fetchShareConfig() {
      if (!companyId) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, 'companies', companyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCustomMessage(data.customShareMessage || `¡Mira nuestro delicioso menú! 🌮🥗🍰`);
          const imageUrl = data.customShareImageUrl || null;
          setCustomImageUrl(imageUrl);
          setImagePreview(imageUrl);
        }
      } catch (e) {
        toast({ title: 'Error', description: 'No se pudo cargar la configuración para compartir.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    
    if(companyId) fetchShareConfig();
  }, [companyId, toast]);

  const handleCopyToClipboard = () => {
    if (!menuUrl) return;
    navigator.clipboard.writeText(menuUrl)
      .then(() => toast({ title: "¡Enlace copiado!", description: "El enlace del menú ha sido copiado al portapapeles." }))
      .catch(() => toast({ title: 'Error', description: 'No se pudo copiar el enlace', variant: "destructive" }));
  };

  const handleShareViaWhatsApp = () => {
    if (!menuUrl) return;
    const message = `${customMessage}\n\n${menuUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleDownloadQR = async () => {
    if (!menuUrl) return;
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`;
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'menu-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Descarga iniciada", description: "El código QR se está descargando." });
    } catch (error) {
       toast({ title: "Error de descarga", description: "No se pudo descargar el código QR.", variant: "destructive" });
    }
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = async () => {
    if (!companyId) {
        toast({ title: "Error", description: "No se encontró el ID de la compañía.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    
    let finalImageUrl = customImageUrl;

    try {
      if (imageFile) {
        toast({ title: "Subiendo imagen...", description: "Por favor espera." });
        // Usamos el storageService que funciona correctamente
        const newUrl = await storageService.uploadFile(imageFile, `share_images/${companyId}/`);
        if (newUrl) {
          finalImageUrl = newUrl;
        } else {
            throw new Error("La URL de la imagen no se pudo generar.");
        }
      }

      await setDoc(doc(db, 'companies', companyId), {
        customShareMessage: customMessage,
        customShareImageUrl: finalImageUrl,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      setCustomImageUrl(finalImageUrl);
      setImageFile(null); // Limpiar el archivo después de guardar
      setShowSuccess(true); // Mostrar modal de éxito

    } catch (e: any) {
      console.error("Error al guardar o subir:", e);
      toast({ title: 'Error al Guardar', description: e.message || 'No se pudo guardar la configuración.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading || !companyId) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-1/2 mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <>
    <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="¡Guardado Correctamente!"
        message="La configuración para compartir tu menú ha sido actualizada."
    />
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary text-center">Compartir menú</h1>
      <p className="text-lg text-muted-foreground text-center">Personaliza cómo se ve tu menú al compartirlo y usa las herramientas para llegar a más clientes.</p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Personaliza tu Mensaje</CardTitle>
          <CardDescription>Edita el mensaje y la imagen que se mostrarán al compartir tu menú.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customMessage">Mensaje para WhatsApp</Label>
            <Textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="¡Mira nuestro delicioso menú! 🌮🥗🍰"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">El enlace a tu menú se añadirá automáticamente al final.</p>
          </div>
          <div className="space-y-2">
            <Label>Imagen para Vista Previa</Label>
            <div className="flex items-center gap-4">
              <Image 
                src={imagePreview || "https://placehold.co/200x200.png?text=Imagen"}
                alt="Vista previa de imagen para compartir"
                width={100}
                height={100}
                className="rounded-md border object-cover"
                data-ai-hint="share image"
              />
              <Button asChild variant="outline" disabled={isSaving}>
                <label htmlFor="image-upload" className="cursor-pointer flex items-center">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Cambiar Imagen
                  <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </Button>
            </div>
             <p className="text-xs text-muted-foreground mt-1">Esta imagen se usará en vistas previas de redes sociales. Haz clic en 'Guardar Cambios' para subirla.</p>
          </div>
          <Button onClick={handleSaveConfig} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Enlace del Menú</CardTitle>
          <CardDescription>Usa este enlace para compartir tu menú digital donde quieras.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input id="menuLink" value={menuUrl} readOnly className="flex-grow" />
            <Button onClick={handleCopyToClipboard} variant="outline" size="icon" aria-label="Copiar enlace">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Compartir por WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleShareViaWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white">
              <WhatsAppIcon className="mr-2 h-5 w-5" /> Enviar por WhatsApp
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Código QR</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="p-4 border rounded-lg bg-white">
              <Image 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(menuUrl)}`} 
                  alt="Menu QR Code" 
                  width={150} 
                  height={150}
                  data-ai-hint="QR code"
              />
            </div>
            <Button variant="outline" onClick={handleDownloadQR}>
              <Download className="mr-2 h-4 w-4"/>
              Descargar QR
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
