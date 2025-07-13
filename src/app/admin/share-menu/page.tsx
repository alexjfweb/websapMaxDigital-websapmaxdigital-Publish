"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Label might not be used directly here but good to keep for consistency
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WhatsAppIcon from "@/components/icons/whatsapp-icon";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function AdminShareMenuPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMenuUrl(window.location.origin + "/menu");
    }
  }, []);


  const handleCopyToClipboard = () => {
    if (!menuUrl) return;
    navigator.clipboard.writeText(menuUrl)
      .then(() => {
        toast({
          title: t('adminShareMenu.toast.copiedTitle'),
          description: t('adminShareMenu.toast.copiedDescription'),
        });
      })
      .catch(err => {
        toast({
          title: t('adminShareMenu.toast.errorTitle'),
          description: t('adminShareMenu.toast.errorDescription'),
          variant: "destructive",
        });
        console.error('Failed to copy: ', err);
      });
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
        <h1 className="text-3xl font-bold text-primary">{t('adminShareMenu.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('adminShareMenu.loadingDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary text-center">{t('adminShareMenu.pageTitle')}</h1>
      <p className="text-lg text-muted-foreground text-center">{t('adminShareMenu.pageDescription')}</p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('adminShareMenu.linkCard.title')}</CardTitle>
          <CardDescription>{t('adminShareMenu.linkCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input id="menuLink" value={menuUrl} readOnly className="flex-grow" />
            <Button onClick={handleCopyToClipboard} variant="outline" size="icon" aria-label={t('adminShareMenu.linkCard.copyAriaLabel')}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('adminShareMenu.linkCard.infoText')}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('adminShareMenu.whatsappCard.title')}</CardTitle>
          <CardDescription>{t('adminShareMenu.whatsappCard.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleShareViaWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white">
            <WhatsAppIcon className="mr-2 h-5 w-5" /> {t('adminShareMenu.whatsappCard.shareButton')}
          </Button>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {t('adminShareMenu.whatsappCard.infoText')}
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('adminShareMenu.qrCard.title')}</CardTitle>
          <CardDescription>{t('adminShareMenu.qrCard.description')}</CardDescription>
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
          <Button variant="outline">{t('adminShareMenu.qrCard.downloadButton')}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
