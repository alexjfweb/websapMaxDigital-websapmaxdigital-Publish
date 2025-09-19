
"use client";

import PublicHeader from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <>
      <PublicHeader />
      <main className="container mx-auto px-4 py-24">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Política de Privacidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Su privacidad es importante para nosotros. Es política de WebSapMax respetar su privacidad con respecto a cualquier información que podamos recopilar de usted a través de nuestro sitio web.
            </p>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                1. Información que recopilamos
              </h2>
              <p>
                Solicitamos información personal solo cuando realmente la necesitamos para brindarle un servicio. La recopilamos por medios justos y legales, con su conocimiento y consentimiento.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                2. Cómo usamos su información
              </h2>
              <p>
                Utilizamos la información que recopilamos para operar, mantener y mejorar nuestro sitio web y servicios, así como para comunicarnos con usted, ya sea directamente o a través de uno de nuestros socios.
              </p>
            </section>

             <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                3. Seguridad
              </h2>
              <p>
                La seguridad de sus datos personales es importante para nosotros, pero recuerde que ningún método de transmisión por Internet o método de almacenamiento electrónico es 100% seguro.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
