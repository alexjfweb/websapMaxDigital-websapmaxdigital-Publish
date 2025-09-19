
"use client";

import PublicHeader from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CancelSubscriptionPage() {
  return (
    <>
      <PublicHeader />
      <main className="container mx-auto px-4 py-24">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Cancelar Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Lamentamos que quieras irte. Para cancelar tu suscripción, por favor sigue los siguientes pasos:
            </p>

            <ol className="list-decimal list-inside space-y-2">
              <li>Inicia sesión en tu cuenta.</li>
              <li>Navega a la sección de "Suscripción" en tu panel de administración.</li>
              <li>Sigue las instrucciones para cancelar tu plan actual.</li>
            </ol>
            
            <p>
              Si tienes algún problema o pregunta, no dudes en contactar a nuestro equipo de soporte a través de <a href="mailto:info@websap.site" className="text-primary hover:underline">info@websap.site</a>.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
