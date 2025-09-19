
"use client";

import PublicHeader from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalNoticePage() {
  return (
    <>
      <PublicHeader />
      <main className="container mx-auto px-4 py-24">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Aviso Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Información legal sobre WebSapMax y el uso de este sitio web.
            </p>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                1. Datos del Titular
              </h2>
              <p>
                <strong>Nombre Comercial:</strong> WebSapMax<br />
                <strong>CIF:</strong> B12345678<br />
                <strong>Email:</strong> info@websap.site<br />
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                2. Propiedad Intelectual
              </h2>
              <p>
                Todos los contenidos de este sitio web, incluyendo textos, gráficos, logos e imágenes, son propiedad de WebSapMax o de sus proveedores de contenido.
              </p>
            </section>
            
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                3. Legislación Aplicable
              </h2>
              <p>
                La relación entre WebSapMax y el usuario se regirá por la normativa colombiana vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de Bucaramanga.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
