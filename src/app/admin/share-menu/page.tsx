"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WhatsAppIcon from "@/components/icons/whatsapp-icon";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function AdminShareMenuPage() {
  const { toast } = useToast();
  const [menuUrl, setMenuUrl] = useState('');
  const [openCopiedModal, setOpenCopiedModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMenuUrl(window.location.origin + "/menu");
    }
  }, []);


  const handleCopyToClipboard = () => {
    if (!menuUrl) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(menuUrl)
        .then(() => {
          setOpenCopiedModal(true);
        })
        .catch(err => {
          toast({
            title: '¡Error!',
            description: 'No se pudo copiar el enlace',
            variant: "destructive",
          });
          console.error('Failed to copy: ', err);
        });
    } else {
      // Fallback para contextos inseguros
      try {
        const textArea = document.createElement("textarea");
        textArea.value = menuUrl;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setOpenCopiedModal(true);
      } catch (err) {
        toast({
          title: '¡Error!',
          description: 'No se pudo copiar el enlace',
          variant: "destructive",
        });
        console.error('Failed to copy: ', err);
      }
    }
  };

  const handleShareViaWhatsApp = () => {
    if (!menuUrl) return;
    const message = `Check out our delicious menu at websapMax: ${menuUrl}`; // This message could also be translated
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!menuUrl) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Compartir menú</h1>
        <p className="text-lg text-muted-foreground">Cargando descripción...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary text-center">Compartir menú</h1>
      <p className="text-lg text-muted-foreground text-center">Descripción de la página...</p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Enlace</CardTitle>
          <CardDescription>Descripción del enlace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input id="menuLink" value={menuUrl} readOnly className="flex-grow" />
            <Button onClick={handleCopyToClipboard} variant="outline" size="icon" aria-label="Copiar enlace">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Información adicional sobre el enlace
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Compartir por WhatsApp</CardTitle>
          <CardDescription>Descripción del botón de WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleShareViaWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white">
            <WhatsAppIcon className="mr-2 h-5 w-5" /> Compartir por WhatsApp
          </Button>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Información adicional sobre el botón de WhatsApp
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Código QR</CardTitle>
          <CardDescription>Descripción del código QR</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="p-4 border rounded-lg bg-white">
            <Image 
                src={`https://placehold.co/200x200.png?text=QR+Code+for+${encodeURIComponent(menuUrl)}`} 
                alt="Menu QR Code" 
                width={200} 
                height={200}
                data-ai-hint="QR code"
            />
          </div>
          <Button variant="outline">Descargar código QR</Button>
        </CardContent>
      </Card>

      {/* Modal de enlace copiado */}
      <Dialog open={openCopiedModal} onOpenChange={setOpenCopiedModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">¡Enlace copiado!</DialogTitle>
            <DialogDescription className="text-center">
              El enlace del menú ha sido copiado al portapapeles.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setOpenCopiedModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
