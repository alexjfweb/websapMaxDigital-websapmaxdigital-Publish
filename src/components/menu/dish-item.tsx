import * as React from 'react';
import Image from 'next/image';
import type { Dish } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Star, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DishItemProps {
  dish: Dish;
  onAddToCart: (dish: Dish) => void;
  styles: any; // Recibe los estilos como props
  t?: any;
}

export default function DishItem({ dish, onAddToCart, styles, t }: DishItemProps) {
  const renderStars = (likes: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < likes ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/50'}`} />
    ));
  };

  return (
    <Card 
      className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full"
      style={{ background: styles.secondary_color }}
    >
      {styles.show_images && (
        <div className="relative w-full h-48">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={`${dish.category} food`}
          />
          {dish.stock === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">Agotado</Badge>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-xl leading-tight" style={{ color: styles.text_color }}>{dish.name}</CardTitle>
        {styles.show_ratings && (
          <div className="flex items-center gap-1 mt-1">
            {renderStars(dish.likes)}
            <span className="text-xs text-muted-foreground">({dish.likes})</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-3">{dish.description}</CardDescription>
        <p className="text-lg font-semibold" style={{ color: styles.price_color }}>${dish.price.toFixed(2)}</p>
        {dish.stock > 0 && dish.stock < 10 && (
          <p className="text-xs text-destructive mt-1">¡Solo {dish.stock} en stock!</p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onAddToCart(dish)} 
          disabled={dish.stock === 0}
          className="w-full text-white"
          style={{ backgroundColor: styles.primary_color }}
        >
          {dish.stock === 0 ? <XCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          {dish.stock === 0 ? 'No disponible' : 'Agregar al pedido'}
        </Button>
      </CardFooter>
    </Card>
  );
}
