import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, ShoppingCart, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { translations } from '@/translations';
import type { Language } from '@/types/i18n';

// Esta página ahora es un Componente de Servidor.
// Las traducciones se manejan directamente aquí para evitar errores de hidratación.
export default function HomePage() {
  const lang: Language = 'en'; // Se define el idioma por defecto en el servidor.
  const currentYear = new Date().getFullYear();

  // Función de traducción simple que se ejecuta en el servidor.
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: unknown = translations[lang] || translations['en']; // Fallback a inglés
    for (const k of keys) {
      if (typeof result === 'object' && result !== null && k in result) {
        // @ts-expect-error: index access
        result = result[k];
      } else {
        let fallbackResult: unknown = translations['en'];
        for (const fk of keys) {
          if (typeof fallbackResult === 'object' && fallbackResult !== null && fk in fallbackResult) {
            // @ts-expect-error: index access
            fallbackResult = fallbackResult[fk];
          } else {
            return key;
          }
        }
        return (typeof fallbackResult === 'string' ? fallbackResult : key) as string;
      }
    }
    return (typeof result === 'string' ? result : key) as string;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] text-center p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4">
          {t('home.welcome')}
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
          {t('home.subline')}
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 max-w-5xl w-full">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Utensils className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl text-center">
              {t('home.interactiveMenuTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              {t('home.interactiveMenuDescription')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl text-center">
              {t('home.easyOrderingTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
             {t('home.easyOrderingDescription')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Share2 className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl text-center">
              {t('home.shareConnectTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              {t('home.shareConnectDescription')}
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
          {t('home.exploreButton')}
        </Button>
      </Link>

      <footer className="mt-16 text-muted-foreground text-sm">
        <p>&copy; {currentYear} {t('home.footerCopyright')}</p>
        <p>{t('home.footerExperience')}</p>
      </footer>
    </div>
  );
}
