
"use client";

import { useEffect, useState, useContext } from 'react'; // Added useContext
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, ShoppingCart, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage, type Language } from '@/contexts/language-context'; // Added

export default function HomePage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const { language } = useLanguage(); // Consuming language context

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const welcomeMessages: Record<Language, string> = {
    en: "Welcome to websapMax!",
    es: "¡Bienvenido a websapMax!",
    pt: "Bem-vindo ao websapMax!",
    fr: "Bienvenue chez websapMax!"
  };

  const sublineMessages: Record<Language, string> = {
    en: "Your ultimate digital menu solution. Explore delicious dishes, place orders seamlessly, and share with ease.",
    es: "Tu solución definitiva de menú digital. Explora platos deliciosos, realiza pedidos sin problemas y comparte con facilidad.",
    pt: "Sua solução definitiva de menu digital. Explore pratos deliciosos, faça pedidos de forma transparente e compartilhe com facilidade.",
    fr: "Votre solution de menu numérique ultime. Explorez des plats délicieux, passez des commandes en toute simplicité et partagez facilement."
  };

  const exploreButtonMessages: Record<Language, string> = {
    en: "Explore Our Menu",
    es: "Explora Nuestro Menú",
    pt: "Explore Nosso Cardápio",
    fr: "Découvrez Notre Menu"
  };
  
  const footerCopyrightMessages: Record<Language, string> = {
    en: "websapMax. All rights reserved.",
    es: "websapMax. Todos los derechos reservados.",
    pt: "websapMax. Todos os direitos reservados.",
    fr: "websapMax. Tous droits réservés."
  };

  const footerExperienceMessages: Record<Language, string> = {
    en: "Experience the future of dining.",
    es: "Experimenta el futuro de la gastronomía.",
    pt: "Experimente o futuro da gastronomia.",
    fr: "Découvrez l'avenir de la restauration."
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] text-center p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4">
          {welcomeMessages[language] || welcomeMessages['en']}
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
          {sublineMessages[language] || sublineMessages['en']}
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 max-w-5xl w-full">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Utensils className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl text-center">
              {language === 'es' ? 'Menú Interactivo' : 
               language === 'pt' ? 'Cardápio Interativo' :
               language === 'fr' ? 'Menu Interactif' : 
               'Interactive Menu'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              {language === 'es' ? 'Navega por nuestro extenso menú con hermosas imágenes y descripciones detalladas.' :
               language === 'pt' ? 'Navegue pelo nosso extenso cardápio com belas imagens e descrições detalhadas.' :
               language === 'fr' ? 'Parcourez notre menu complet avec de belles images et des descriptions détaillées.' :
               'Browse our extensive menu with beautiful images and detailed descriptions.'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl text-center">
              {language === 'es' ? 'Pedidos Fáciles' : 
               language === 'pt' ? 'Pedidos Fáceis' :
               language === 'fr' ? 'Commande Facile' : 
               'Easy Ordering'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
             {language === 'es' ? 'Añade tus platos favoritos al carrito y envía tu pedido directamente por WhatsApp.' :
              language === 'pt' ? 'Adicione seus pratos favoritos ao carrinho e envie seu pedido diretamente pelo WhatsApp.' :
              language === 'fr' ? 'Ajoutez vos plats préférés au panier et envoyez votre commande directement via WhatsApp.' :
              'Add your favorite dishes to the cart and send your order directly via WhatsApp.'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Share2 className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl text-center">
              {language === 'es' ? 'Comparte y Conecta' : 
               language === 'pt' ? 'Compartilhe e Conecte' :
               language === 'fr' ? 'Partagez et Connectez' : 
               'Share & Connect'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              {language === 'es' ? 'Comparte fácilmente nuestro menú con amigos y familiares o haz reservaciones.' :
               language === 'pt' ? 'Compartilhe facilmente nosso cardápio com amigos e familiares ou faça reservas.' :
               language === 'fr' ? 'Partagez facilement notre menu avec vos amis et votre famille ou faites des réservations.' :
               'Easily share our menu with friends and family or make reservations.'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="relative w-full max-w-3xl aspect-video rounded-lg overflow-hidden shadow-2xl mb-12">
        <Image 
          src="https://placehold.co/800x450.png" 
          alt="Delicious Food Montage" 
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          data-ai-hint="food restaurant" 
        />
      </div>

      <Link href="/menu" passHref>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          {exploreButtonMessages[language] || exploreButtonMessages['en']}
        </Button>
      </Link>

      <footer className="mt-16 text-muted-foreground text-sm">
        <p>&copy; {currentYear !== null ? currentYear : new Date().getFullYear()} {footerCopyrightMessages[language] || footerCopyrightMessages['en']}</p>
        <p>{footerExperienceMessages[language] || footerExperienceMessages['en']}</p>
      </footer>
    </div>
  );
}
