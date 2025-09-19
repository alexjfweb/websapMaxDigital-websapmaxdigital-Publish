
import PublicHeader from '@/components/layout/public-header';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';

export default function ArticlePage() {
  return (
    <>
      <PublicHeader />
      <div className="bg-gray-50 text-gray-800 font-serif">
        <main className="container mx-auto px-4 py-16 sm:py-24">
          <article className="max-w-3xl mx-auto">
            <header className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Newspaper className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-sans text-gray-900 leading-tight">
                Todo lo que necesitas para digitalizar tu negocio gastronómico
              </h1>
              <p className="mt-4 text-lg text-gray-600 font-sans">
                La revolución digital que tu negocio merece
              </p>
            </header>

            <div className="prose prose-lg max-w-none text-lg leading-relaxed space-y-8">
              <p>
                En un mundo cada vez más competitivo, la clave para destacar ya no está solo en el sabor de tus platillos, sino también en la experiencia que ofreces a tus clientes. La tecnología se ha convertido en un aliado indispensable para restaurantes, cafeterías, food trucks y servicios de catering que desean crecer, modernizarse y multiplicar sus ventas.
              </p>

              <div className="my-8 flex justify-center">
                <Image
                  src="/imagen/carracteristica-QE-AJ.png"
                  alt="Digitalización de restaurantes"
                  width={800}
                  height={450}
                  className="rounded-lg shadow-lg"
                  unoptimized
                  data-ai-hint="restaurant management app"
                />
              </div>

              <section>
                <h2 className="text-3xl font-bold font-sans text-gray-900 mb-4 border-b pb-2">Menús interactivos: conquista desde el primer vistazo</h2>
                <p>
                  ¿Sabías que la primera impresión de tu cliente ocurre incluso antes de probar tu comida? Con menús digitales interactivos, no solo muestras tus platillos de manera atractiva, sino que logras despertar emociones. Fotos irresistibles, descripciones claras y actualizaciones inmediatas convierten cada consulta en una invitación a ordenar.
                </p>
                <p>
                  Los menús físicos limitados, desgastados o poco llamativos quedan en el pasado. Ahora, tus clientes disfrutan de una experiencia visual moderna y sencilla que despierta apetito y confianza desde el primer momento.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold font-sans text-gray-900 mb-4 border-b pb-2">Gestión de pedidos en tiempo real: cero errores, más eficiencia</h2>
                <p>
                  El ritmo de la vida actual exige rapidez y precisión. Con un sistema digital, cada pedido llega directamente a tu cocina o área de preparación sin intermediarios que puedan generar errores. Elimina confusiones, agiliza tiempos de entrega y ofrece un servicio mucho más profesional.
                </p>
                <p>
                  Además, contar con pedidos en tiempo real permite medir la demanda, conocer cuáles son los platillos más vendidos y tomar decisiones inteligentes para optimizar tus operaciones.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold font-sans text-gray-900 mb-4 border-b pb-2">Un sistema ágil y moderno que transforma tu negocio</h2>
                <p>
                  Digitalizar tu restaurante o cafetería no es un lujo, es una inversión estratégica. Gracias a herramientas tecnológicas fáciles de usar, puedes:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4 font-sans">
                  <li>Organizar pedidos de manera automática.</li>
                  <li>Ofrecer distintos métodos de pago.</li>
                  <li>Conectar tu menú con redes sociales y páginas web.</li>
                  <li>Garantizar una atención más fluida y sin interrupciones.</li>
                </ul>
                <p>
                  Lo que antes tomaba minutos y podía generar errores, ahora se resuelve en segundos con precisión y control.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold font-sans text-gray-900 mb-4 border-b pb-2">Beneficios que elevan la satisfacción de tus comensales</h2>
                <p>
                  Cuando tus clientes sienten que todo fluye sin complicaciones, la experiencia se vuelve memorable. Un pedido sin errores, tiempos de espera reducidos y un menú atractivo generan confianza y fidelidad. Y cuando un comensal regresa o recomienda tu negocio, las ventas crecen de manera exponencial.
                </p>
                <p>
                  La digitalización no solo te ayuda a vender más, sino a construir una comunidad de clientes leales que se convierten en embajadores de tu marca.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold font-sans text-gray-900 mb-4 border-b pb-2">La tecnología como motor de tu éxito culinario</h2>
                <p>
                  La verdadera pregunta no es si deberías digitalizar tu negocio, sino cuánto tiempo más puedes permitirte seguir sin hacerlo. La competencia ya está avanzando y tus clientes esperan comodidad, rapidez y experiencias modernas.
                </p>
                <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-6 bg-blue-50 italic">
                  <p className="font-semibold font-sans">
                    Con la herramienta adecuada, no solo automatizas procesos: <strong>impulsas tus ventas como nunca antes, reduces costos operativos y multiplicas la satisfacción de quienes te visitan</strong>.
                  </p>
                </blockquote>
              </section>

              <section>
                <h2 className="text-3xl font-bold font-sans text-gray-900 mb-4 border-b pb-2">Da el siguiente paso hoy mismo</h2>
                <p>
                  Tu negocio tiene todo el potencial para convertirse en una referencia gastronómica en tu ciudad. Con menús digitales interactivos y un sistema de gestión de pedidos en tiempo real, estarás listo para sorprender a tus clientes y llevar tu éxito al siguiente nivel.
                </p>
                <div className="mt-6 p-6 bg-gray-100 rounded-lg">
                  <p className="text-center text-xl font-semibold font-sans">
                    No dejes que las oportunidades pasen frente a tu puerta. <strong>La digitalización es el ingrediente secreto que estabas buscando para elevar tu negocio y hacerlo crecer sin límites.</strong>
                  </p>
                </div>
              </section>
            </div>
          </article>
        </main>
      </div>
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
                        <li><Link href="/unsubscribe" className="footer__link text-gray-300 hover:text-[#E60023] transition-colors" aria-label="Cancelar suscripción">Cancelar suscripción</Link></li>
                    </ul>
                    </div>

                    <div className="footer__section footer__company-info">
                    <h4 className="footer__title font-bold text-sm uppercase tracking-wider mb-4">Contacto</h4>
                    <address className="footer__address not-italic text-gray-300 space-y-1">
                        <p>Colombia</p>
                        <p>info@websap.site</p>
                    </address>
                    </div>
                </div>

                <div className="footer__bottom border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-400">
                    <p>© {new Date().getFullYear()} WebSapMax – CIF B12345678</p>
                </div>
            </div>
        </footer>
    </>
  );
}
