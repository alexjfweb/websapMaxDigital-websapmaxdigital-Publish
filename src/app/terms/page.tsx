
"use client";

import PublicHeader from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <>
      <PublicHeader />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 py-24">
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
        <footer id="contact" className="footer bg-[#4D2C1B] text-white py-12">
            <div className="container mx-auto px-6">
                <div className="footer__content flex flex-wrap justify-between items-start gap-10">
                    <div className="footer__section footer__payments">
                    <h4 className="footer__title font-bold text-sm uppercase tracking-wider mb-4">Aceptamos</h4>
                    <div className="footer__logos flex items-center gap-4 bg-white p-2 rounded-md">
                        <Image 
                            src="/imagen/tarjetadecreditos-websaap-2.png"
                            alt="Métodos de pago aceptados"
                            width={250}
                            height={40}
                            className="object-contain"
                            data-ai-hint="payment methods"
                            unoptimized
                        />
                    </div>
                    </div>
                    
                    <div className="footer__section footer__legal-links">
                    <h4 className="footer__title font-bold text-sm uppercase tracking-wider mb-4">Legal</h4>
                    <ul className="footer__list space-y-2">
                        <li><Link href="/terms" className="footer__link text-gray-300 hover:text-[#E60023] transition-colors" aria-label="Términos de Servicio">Términos de Servicio</Link></li>
                        <li><Link href="/privacy" className="footer__link text-gray-300 hover:text-[#E60023] transition-colors" aria-label="Política de Privacidad">Política de Privacidad</Link></li>
                        <li><Link href="/cookies" className="footer__link text-gray-300 hover:text-[#E60023] transition-colors" aria-label="Política de Cookies">Política de Cookies</Link></li>
                        <li><Link href="/legal" className="footer__link text-gray-300 hover:text-[#E60023] transition-colors" aria-label="Aviso Legal">Aviso Legal</Link></li>
                        <li><Link href="/cancel" className="footer__link text-gray-300 hover:text-[#E60023] transition-colors" aria-label="Cancelar suscripción">Cancelar suscripción</Link></li>
                    </ul>
                    </div>

                    <div className="footer__section footer__company-info">
                    <h4 className="footer__title font-bold text-sm uppercase tracking-wider mb-4">Contacto</h4>
                    <address className="footer__address not-italic text-gray-300 space-y-1">
                        <p>Colombia</p>
                        <p><a href="mailto:info@websap.site" className="hover:text-[#E60023] transition-colors">info@websap.site</a></p>
                    </address>
                    </div>
                </div>

                <div className="footer__bottom border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-400">
                    <p>© {new Date().getFullYear()} WebSapMax – CIF B12345678</p>
                </div>
            </div>
        </footer>
      </div>
    </>
  );
}
