
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Send } from 'lucide-react';
import SupportRequestDialog from '@/components/support/SupportRequestDialog';
import { useSubscription } from '@/hooks/use-subscription';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSupportPage() {
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const { company, plan } = subscription || {};

  return (
    <>
      {company && (
        <SupportRequestDialog
          isOpen={isSupportDialogOpen}
          onClose={() => setIsSupportDialogOpen(false)}
          companyId={company.id}
          companyName={company.name}
          planName={plan?.name || 'No Asignado'}
        />
      )}
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <LifeBuoy className="h-8 w-8" />
            Soporte Técnico
          </h1>
          <p className="text-lg text-muted-foreground">
            ¿Necesitas ayuda? Nuestro equipo está aquí para asistirte.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Crear una nueva solicitud de soporte</CardTitle>
            <CardDescription>
              Describe tu problema o consulta y nos pondremos en contacto contigo lo antes posible.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Haz clic en el botón de abajo para abrir el formulario y enviar tu solicitud a nuestro equipo de soporte.
            </p>
            <Button size="lg" onClick={() => setIsSupportDialogOpen(true)}>
              <Send className="mr-2 h-5 w-5" />
              Enviar Nueva Solicitud
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
