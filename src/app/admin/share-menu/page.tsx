
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, Save, MessageSquare, Loader2, UploadCloud, XCircle, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WhatsAppIcon from "@/components/icons/whatsapp-icon";
import React, { useEffect, useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { useSession } from "@/contexts/session-context";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { storageService } from "@/services/storage-service";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import SuccessModal from "@/components/ui/success-modal";

export default function AdminShareMenuPage() {
  const { toast } = useToast();
  const { currentUser } = useSession();

  const [menuUrl, setMenuUrl] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const companyId = currentUser?.companyId;
    
    const currentBaseUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://websap.site')
      : (window.location.origin);
    setBaseUrl(currentBaseUrl);
    
    if (companyId) {
      setMenuUrl(`${currentBaseUrl}/menu/${companyId}`);
    }
    
    async function fetchShareConfig() {
      if (!companyId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const db = getDb();
        const docRef = doc(db, 'companies', companyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCustomMessage(data.customShareMessage || `¡Mira nuestro delicioso menú! 🌮🥗🍰`);
          setCustomImageUrl(data.customShareImageUrl || '');
          setImagePreview(data.customShareImageUrl || '');
        }
      } catch (e) {
        toast({ title: 'Error', description: 'No se pudo cargar la configuración para compartir.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    
    if(currentUser?.companyId) fetchShareConfig();
  }, [currentUser?.companyId, toast]);

  const handleCopyToClipboard = (textToCopy: string, successMessage: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "¡Copiado!", description: successMessage }))
      .catch(() => toast({ title: 'Error', description: 'No se pudo copiar el texto.', variant: "destructive" }));
  };

  const handleShareViaWhatsApp = () => {
    const textoParaCompartir = `${customMessage} ${menuUrl}`;
    const encodedMessage = encodeURIComponent(textoParaCompartir);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareWithPreview = () => {
    if (!customImageUrl) {
      toast({
        title: "Imagen requerida",
        description: "Por favor, sube una imagen para la vista previa antes de compartir.",
        variant: "destructive"
      });
      return;
    }
  
    // Extraer la ruta del archivo de la URL completa de GCS
    // Ej: "https://storage.googleapis.com/bucket-name/path/to/image.jpg" -> "path/to/image.jpg"
    const imagePath = customImageUrl.replace('https://storage.googleapis.com/websapmax-images/', '');
    
    // Construir la URL de compartición que apunta a nuestro servidor
    const shareUrl = `${baseUrl}/share/${imagePath}`;
    const textoParaCompartir = `${customMessage} ${shareUrl}`;
    
    const encodedMessage = encodeURIComponent(textoParaCompartir);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
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
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCustomImageUrl('');
  };
  
  const handleSaveConfig = async () => {
    if (!currentUser?.companyId) {
      toast({ title: "Error de Autenticación", description: "No se pudo identificar la compañía.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    
    try {
      let finalImageUrl = customImageUrl;

      if (imageFile) {
        toast({ title: "Subiendo imagen...", description: "Por favor espera." });
        if (customImageUrl && customImageUrl.startsWith('https://storage.googleapis.com')) {
          // No necesitamos eliminar, compressAndUploadFile se encarga si es necesario
        }
        finalImageUrl = await storageService.compressAndUploadFile(imageFile, `share-images/${currentUser.companyId}`);
        setCustomImageUrl(finalImageUrl);
        setImageFile(null);
      } else if (!imagePreview && customImageUrl) {
        // El usuario eliminó la vista previa
        if (customImageUrl.startsWith('https://storage.googleapis.com')) {
            // Lógica de eliminación si es necesario, aunque es mejor no hacerlo automáticamente
        }
        finalImageUrl = '';
      }

      const configToSave = {
        customShareMessage: customMessage,
        customShareImageUrl: finalImageUrl,
        updatedAt: serverTimestamp(),
      };
      
      const db = getDb();
      await setDoc(doc(db, 'companies', currentUser.companyId), configToSave, { merge: true });
      
      setShowSuccess(true);

    } catch (e: any) {
      console.error("Error al guardar:", e);
      toast({ title: 'Error al Guardar', description: e.message || 'No se pudo guardar la configuración.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-upload">Imagen para Vista Previa</Label>
              <div className="flex items-center gap-4">
                 <Button asChild variant="outline">
                      <label htmlFor="image-upload" className="cursor-pointer">
                          <UploadCloud className="mr-2 h-4 w-4"/>
                          Seleccionar Imagen
                      </label>
                 </Button>
                  <Input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  {imagePreview && (
                      <div className="relative">
                          <Image 
                              src={imagePreview}
                              alt="Vista previa"
                              width={80}
                              height={80}
                              className="rounded-md border object-cover"
                              data-ai-hint="share image"
                              unoptimized
                          />
                          <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={clearImage}
                          >
                              <XCircle className="h-4 w-4" />
                          </Button>
                      </div>
                  )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sube una imagen para que aparezca en la vista previa al compartir el enlace.</p>
            </div>
            
            {customImageUrl && (
              <div>
                <Label>URL de la Imagen (para vista previa)</Label>
                <div className="flex items-center space-x-2">
                  <Input type="text" value={customImageUrl} readOnly className="bg-muted" />
                  <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(customImageUrl, 'URL de la imagen copiada.')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Button onClick={handleSaveConfig} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Compartir por WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleShareViaWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white">
                <WhatsAppIcon className="mr-2 h-5 w-5" /> Enviar Enlace Directo
              </Button>
              <Button 
                onClick={handleShareWithPreview} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!customImageUrl}
                title={!customImageUrl ? "Sube una imagen para habilitar esta opción" : "Comparte con una vista previa de la imagen"}
              >
                <Share className="mr-2 h-5 w-5" /> Compartir con Vista Previa
              </Button>
              {!customImageUrl && <p className="text-xs text-muted-foreground text-center">Sube una imagen para habilitar la vista previa.</p>}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Código QR</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="p-4 border rounded-lg bg-white">
                {menuUrl && (
                  <Image 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(menuUrl)}`} 
                      alt="Menu QR Code" 
                      width={150} 
                      height={150}
                      data-ai-hint="QR code"
                  />
                )}
              </div>
              <Button variant="outline" onClick={handleDownloadQR}>
                <Download className="mr-2 h-4 w-4"/>
                Descargar QR
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Enlace del Menú</CardTitle>
            <CardDescription>Usa este enlace para compartir tu menú digital donde quieras.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <Input type="text" value={menuUrl} readOnly className="bg-muted" />
            <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(menuUrl, 'Enlace del menú copiado.')}>
              <Copy className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </>
  );
}
