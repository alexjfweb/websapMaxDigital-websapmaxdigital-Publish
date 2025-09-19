
"use client";

import PublicHeader from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <>
      <PublicHeader />
      <main className="container mx-auto px-4 py-24">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Términos y Condiciones de Servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Bienvenido a WebSapMax. Al utilizar nuestros servicios, usted
              acepta estar sujeto a los siguientes términos y condiciones. Por
              favor, léalos detenidamente.
            </p>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                1. Uso de la Licencia
              </h2>
              <p>
                Se concede permiso para descargar temporalmente una copia de
                los materiales (información o software) en el sitio web de
                WebSapMax para visualización transitoria personal y no
                comercial. Esta es la concesión de una licencia, no una
                transferencia de título.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                2. Descargo de Responsabilidad
              </h2>
              <p>
                Los materiales en el sitio web de WebSapMax se proporcionan
                "tal cual". WebSapMax no ofrece garantías, expresas o
                implícitas, y por la presente renuncia y niega todas las demás
                garantías.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                3. Limitaciones
              </h2>
              <p>
                En ningún caso WebSapMax o sus proveedores serán responsables
                de ningún daño (incluidos, entre otros, daños por pérdida de
                datos o ganancias, o debido a la interrupción del negocio) que
                surja del uso o la incapacidad de usar los materiales en el
                sitio web de WebSapMax.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                4. Revisiones y Erratas
              </h2>
              <p>
                Los materiales que aparecen en el sitio web de WebSapMax
                pueden incluir errores técnicos, tipográficos o fotográficos.
                WebSapMax no garantiza que ninguno de los materiales en su
                sitio web sea preciso, completo o actual.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                5. Modificaciones de los Términos
              </h2>
              <p>
                WebSapMax puede revisar estos términos de servicio para su
                sitio web en cualquier momento sin previo aviso. Al utilizar
                este sitio web, usted acepta estar sujeto a la versión actual
                de estos términos de servicio.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
