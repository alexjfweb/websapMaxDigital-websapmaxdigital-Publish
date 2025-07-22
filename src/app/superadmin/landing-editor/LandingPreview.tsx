"use client";

import React from "react";

interface LandingPreviewProps {
  config: any;
  plans: any[];
}

export default function LandingPreview({ config, plans }: LandingPreviewProps) {
  if (!config) return <div className="text-center py-8">Sin datos para previsualizar</div>;

  return (
    <div className="w-full min-h-screen bg-cover bg-center" style={{ backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined }}>
      {/* Banner principal */}
      {config.sections?.banner !== false && (
        <section className="py-16 text-center" style={{ color: config.textColor }}>
          {config.logo && <img src={config.logo} alt="Logo" className="mx-auto mb-4 max-h-24 animate-fade-in" />}
          <h1 className="text-4xl font-bold mb-2 animate-slide-in">{config.mainTitle}</h1>
          <h2 className="text-xl mb-4 animate-fade-in" style={{ color: config.textColor }}>{config.subtitle}</h2>
        </section>
      )}
      {/* Tarjetas de servicios */}
      {config.sections?.serviceCards !== false && config.serviceCards && (
        <section className="py-8 flex flex-wrap justify-center gap-6 animate-fade-in">
          {config.serviceCards.map((card: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg p-6 w-72 flex flex-col items-center transition-transform hover:scale-105 animate-zoom-in">
              {card.image && <img src={card.image} alt={card.title} className="mb-3 max-h-20" />}
              <div className="font-bold text-lg mb-1">{card.title}</div>
              <div className="text-gray-600 text-sm text-center">{card.description}</div>
            </div>
          ))}
        </section>
      )}
      {/* Sección de planes */}
      {config.sections?.plans !== false && plans.length > 0 && (
        <section className="py-12 bg-gray-50 animate-fade-in">
          <h3 className="text-2xl font-bold text-center mb-8">Planes de Suscripción</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {plans.map((plan, idx) => (
              <div key={plan.id || idx} className="bg-white rounded-lg shadow-md p-6 w-72 flex flex-col items-center border-t-4 border-blue-500 animate-slide-in">
                <div className="font-bold text-xl mb-2">{plan.name}</div>
                <div className="text-2xl text-blue-600 font-bold mb-1">${plan.price} <span className="text-base font-normal">/ {plan.period}</span></div>
                <ul className="text-sm text-gray-700 mb-3">
                  {plan.features.map((f: string, i: number) => <li key={i}>- {f}</li>)}
                </ul>
                <button className="mt-auto bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors animate-zoom-in">
                  {plan.ctaText}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Video promocional */}
      {config.sections?.video && config.promoVideo?.enabled && config.promoVideo?.url && (
        <section className="py-8 flex justify-center animate-fade-in">
          {config.promoVideo.type === "youtube" ? (
            <iframe width="560" height="315" src={config.promoVideo.url} title="Video promocional" frameBorder="0" allowFullScreen></iframe>
          ) : config.promoVideo.type === "vimeo" ? (
            <iframe src={config.promoVideo.url} width="560" height="315" frameBorder="0" allowFullScreen></iframe>
          ) : (
            <video src={config.promoVideo.url} controls className="max-w-full max-h-80" />
          )}
        </section>
      )}
      {/* Contacto y redes sociales */}
      {(config.sections?.contact || config.sections?.social) && (
        <footer className="py-6 text-center text-gray-500 animate-fade-in">
          {config.sections?.contact && <div>Contacto: info@websapmaxdigital.com</div>}
          {config.sections?.social && (
            <div className="mt-2 flex justify-center gap-4">
              {/* Aquí puedes agregar íconos de redes sociales si están en la config */}
              <a href="#" className="hover:text-blue-600">Facebook</a>
              <a href="#" className="hover:text-blue-600">Instagram</a>
              <a href="#" className="hover:text-blue-600">WhatsApp</a>
            </div>
          )}
        </footer>
      )}
    </div>
  );
} 