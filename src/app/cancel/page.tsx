
"use client";

import PublicHeader from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import Link from 'next/link';

export default function CancelSubscriptionPage() {
  return (
    <>
      <PublicHeader />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 py-24">
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
