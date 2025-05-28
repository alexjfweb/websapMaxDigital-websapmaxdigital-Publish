
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

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
  nequiQrUrl: "https://placehold.co/200x200.png?text=NequiQR",
};


export default function AdminProfilePage() {
  const { t } = useLanguage();

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
                <img src={mockProfile.logoUrl} alt="Current Logo" className="h-24 w-24 rounded-md border object-cover" data-ai-hint="logo placeholder"/>
                <Button variant="outline">
                    <UploadCloud className="mr-2 h-4 w-4" /> {t('adminProfile.businessInfoCard.uploadLogoButton')}
                    <Input type="file" className="hidden" accept="image/*" />
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">Recommended size: 200x200px. Max 2MB.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>{t('adminProfile.paymentMethodsCard.title')}</CardTitle>
          <CardDescription>{t('adminProfile.paymentMethodsCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>{t('adminProfile.paymentMethodsCard.nequiQrLabel')}</Label>
                <div className="flex items-center gap-4">
                    <img src={mockProfile.nequiQrUrl} alt="Nequi QR Code" className="h-24 w-24 rounded-md border object-cover" data-ai-hint="QR code placeholder"/>
                    <Button variant="outline">
                        <UploadCloud className="mr-2 h-4 w-4" /> {t('adminProfile.paymentMethodsCard.uploadNequiQrButton')}
                        <Input type="file" className="hidden" accept="image/*" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">Upload the QR code image for Nequi payments.</p>
            </div>
            <div className="flex items-center space-x-2">
                <Input type="checkbox" id="cod" defaultChecked />
                <Label htmlFor="cod" className="text-sm font-normal">
                    {t('adminProfile.paymentMethodsCard.enableCodLabel')}
                </Label>
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
