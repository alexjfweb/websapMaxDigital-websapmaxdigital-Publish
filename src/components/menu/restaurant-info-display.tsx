
import * as React from 'react';
import Image from 'next/image';
import type { Company } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, MapPin, Info } from 'lucide-react';

interface RestaurantInfoDisplayProps {
  restaurant: Partial<Company> & { logoUrl?: string; description?: string; bannerUrl?: string };
}

export default function RestaurantInfoDisplay({ restaurant }: RestaurantInfoDisplayProps) {
  return (
    <Card className="w-full overflow-hidden shadow-xl bg-card/80 backdrop-blur-sm">
      <div className="relative h-48 md:h-64 w-full">
        <Image
          src={restaurant.bannerUrl || "https://placehold.co/1200x400.png?text=Bienvenido"}
          alt={`${restaurant.name} Banner`}
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="opacity-80"
          data-ai-hint="restaurant interior"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-2">
            <Image
              src={restaurant.logoUrl || "https://placehold.co/100x100.png?text=Logo"}
              alt={`${restaurant.name} Logo`}
              width={80}
              height={80}
              className="rounded-full border-4 border-background shadow-lg"
              data-ai-hint="restaurant logo"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight">
              {restaurant.name}
            </h1>
          </div>
        </div>
      </div>
      <CardContent className="p-6 md:p-8 space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-primary mb-2 flex items-center">
              <Info className="h-5 w-5 mr-2" /> Sobre nosotros
            </h2>
            <p className="text-muted-foreground leading-relaxed">{restaurant.description}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary mb-2 flex items-center">
              <MapPin className="h-5 w-5 mr-2" /> Visítanos
            </h2>
            <p className="text-muted-foreground">{restaurant.addressStreet}</p>
            
            <h2 className="text-xl font-semibold text-primary mt-4 mb-2 flex items-center">
              <Phone className="h-5 w-5 mr-2" /> Contacto
            </h2>
            <p className="text-muted-foreground">{restaurant.phone}</p>
            <p className="text-muted-foreground">Email: <a href={`mailto:${restaurant.email}`} className="hover:text-primary transition-colors">{restaurant.email}</a></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
