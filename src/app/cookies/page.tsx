
"use client";

import PublicHeader from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiesPolicyPage() {
  return (
    <>
      <PublicHeader />
      <main className="container mx-auto px-4 py-24">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Política de Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Este sitio web utiliza cookies para mejorar la experiencia del usuario. A continuación, explicamos qué son las cookies y cómo las utilizamos.
            </p>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                1. ¿Qué son las Cookies?
              </h2>
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tableta, teléfono móvil) cuando visita un sitio web.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                2. ¿Cómo usamos las Cookies?
              </h2>
              <p>
                Utilizamos cookies para entender cómo utiliza nuestro sitio y para mejorar su experiencia. Esto incluye la personalización del contenido y la publicidad.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                3. Gestión de Cookies
              </h2>
              <p>
                Puede controlar y/o eliminar las cookies como desee. Para más información, consulte aboutcookies.org. Puede eliminar todas las cookies que ya están en su ordenador y puede configurar la mayoría de los navegadores para evitar que se instalen.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
