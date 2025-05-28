
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadCloud, Save } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";

// Mock data for payment settings
const mockPaymentSettings = {
  nequiEnabled: true,
  nequiQrUrl: "https://placehold.co/200x200.png?text=Nequi+QR",
  nequiAccountHolder: "websapMax S.A.S",
  nequiAccountNumber: "3001234567",
  codEnabled: true,
};

export default function AdminPaymentsPage() {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('adminPayments.title')}</h1>
      <p className="text-lg text-muted-foreground">{t('adminPayments.description')}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPayments.nequiCard.title')}</CardTitle>
          <CardDescription>{t('adminPayments.nequiCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox id="nequiEnabled" defaultChecked={mockPaymentSettings.nequiEnabled} />
            <Label htmlFor="nequiEnabled" className="text-sm font-medium">
              {t('adminPayments.nequiCard.enableLabel')}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nequiAccountHolder">{t('adminPayments.nequiCard.accountHolderLabel')}</Label>
            <Input id="nequiAccountHolder" defaultValue={mockPaymentSettings.nequiAccountHolder} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nequiAccountNumber">{t('adminPayments.nequiCard.accountNumberLabel')}</Label>
            <Input id="nequiAccountNumber" type="tel" defaultValue={mockPaymentSettings.nequiAccountNumber} />
          </div>
          
          <div className="space-y-2">
            <Label>{t('adminPayments.nequiCard.qrCodeLabel')}</Label>
            <div className="flex items-center gap-4">
              {mockPaymentSettings.nequiQrUrl && (
                <Image 
                    src={mockPaymentSettings.nequiQrUrl} 
                    alt="Current Nequi QR Code" 
                    width={100} 
                    height={100} 
                    className="rounded-md border object-cover"
                    data-ai-hint="QR code payment"
                />
              )}
              <Button variant="outline" asChild>
                <Label htmlFor="nequiQrUpload" className="cursor-pointer">
                  <UploadCloud className="mr-2 h-4 w-4" /> {t('adminPayments.nequiCard.uploadButton')}
                  <Input id="nequiQrUpload" type="file" className="hidden" accept="image/*" />
                </Label>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t('adminPayments.nequiCard.qrUploadDescription')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPayments.codCard.title')}</CardTitle>
          <CardDescription>{t('adminPayments.codCard.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox id="codEnabled" defaultChecked={mockPaymentSettings.codEnabled} />
            <Label htmlFor="codEnabled" className="text-sm font-medium">
              {t('adminPayments.codCard.enableLabel')}
            </Label>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-4">
        <Button>
          <Save className="mr-2 h-4 w-4" /> {t('adminPayments.saveButton')}
        </Button>
      </div>
    </div>
  );
}
