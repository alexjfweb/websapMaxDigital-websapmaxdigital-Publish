"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Facebook, Instagram, Twitter, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WhatsAppIcon from "@/components/icons/whatsapp-icon";
import React, { useEffect, useState } from 'react';

export default function EmployeePromotePage() {
  const { toast } = useToast();
  const [menuUrl, setMenuUrl] = useState('');

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
          toast({
            title: 'Link copiado',
            description: 'El link del menú se ha copiado al portapapeles',
          });
        })
        .catch(err => console.error('Failed to copy: ', err));
    } else {
      // Fallback para contextos inseguros o navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = menuUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: 'Link copiado',
          description: 'El link del menú se ha copiado al portapapeles',
        });
      } catch (err) {
        toast({
          title: 'Error al copiar',
          description: 'No se pudo copiar el enlace.',
          variant: 'destructive',
        });
      }
      document.body.removeChild(textArea);
    }
  };

  const shareOnSocialMedia = (platformUrlTemplate: string) => {
    if (!menuUrl) return;
    const shareText = `Check out the delicious menu at websapMax! ${menuUrl}`;
    const url = platformUrlTemplate.replace('{URL}', encodeURIComponent(menuUrl)).replace('{TEXT}', encodeURIComponent(shareText));
    window.open(url, '_blank');
  };

  if (!menuUrl) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Cargando...</h1>
        <p className="text-lg text-muted-foreground">Cargando descripción...</p>
      </div>
    );
  }

  const socialPlatforms = [
    { name: 'WhatsApp', icon: <WhatsAppIcon className="h-6 w-6" />, action: () => shareOnSocialMedia('https://wa.me/?text={TEXT}'), color: 'hover:bg-[#25D366]/20 hover:text-[#25D366]' },
    { name: 'Facebook', icon: <Facebook className="h-6 w-6" />, action: () => shareOnSocialMedia('https://www.facebook.com/sharer/sharer.php?u={URL}&quote={TEXT}'), color: 'hover:bg-[#1877F2]/20 hover:text-[#1877F2]' },
    { name: 'Instagram', icon: <Instagram className="h-6 w-6" />, action: () => alert('Instagram no está disponible en este momento'), color: 'hover:bg-gradient-to-tr hover:from-pink-500/20 hover:to-yellow-400/20 hover:text-pink-500' },
    { name: 'X', icon: <Twitter className="h-6 w-6" />, action: () => shareOnSocialMedia('https://twitter.com/intent/tweet?url={URL}&text={TEXT}'), color: 'hover:bg-black/20 hover:text-black' },
    { name: 'TikTok', icon: <Music className="h-6 w-6" />, action: () => alert('TikTok no está disponible en este momento'), color: 'hover:bg-black/20 hover:text-[#EE1D52]' },
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Promover menú</h1>
        <p className="text-lg text-muted-foreground mt-2">Descubre cómo promocionar tu menú de manera efectiva</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Copy className="h-5 w-5"/>Título del enlace</CardTitle>
          <CardDescription>Descripción del enlace</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-2">
          <input type="text" value={menuUrl} readOnly className="flex-grow p-2 border rounded-md bg-muted text-sm" />
          <Button onClick={handleCopyToClipboard} variant="outline" size="icon" aria-label="Copiar enlace">
            <Copy className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5"/>Compartir</CardTitle>
          <CardDescription>Comparte el enlace en tus redes sociales</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {socialPlatforms.map(platform => (
            <Button
              key={platform.name}
              onClick={platform.action}
              variant="outline"
              className={`flex flex-col items-center justify-center h-24 p-2 gap-2 group transition-all duration-200 hover:shadow-lg hover:scale-105 focus-visible:scale-105 focus-visible:shadow-lg ${platform.color}`}
            >
              {platform.icon}
              <span className={`text-xs transition-colors duration-200 group-hover:text-inherit`}>{platform.name}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Consejos para promocionar</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Personalizar:</strong> Agrega el logo, colores y fotos de tus platos para que tu menú sea único y reconocible.</p>
          <p><strong>Hashtags:</strong> Usa hashtags populares y relacionados con tu restaurante para llegar a más personas.</p>
          <p><strong>Mejores momentos:</strong> Comparte el menú en horarios de mayor actividad, como almuerzos y cenas.</p>
        </CardContent>
      </Card>

    </div>
  );
}
