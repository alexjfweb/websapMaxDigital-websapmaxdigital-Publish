
"use client";

import PublicHeader from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <>
      <PublicHeader />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 py-24">
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
