

import * as React from 'react';
import Image from 'next/image';
import type { Dish } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Star, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DishItemProps {
  dish: Dish;
  onAddToCart: (dish: Dish) => void;
  styles: any;
  t?: any;
}

export default function DishItem({ dish, onAddToCart, styles }: DishItemProps) {
  const renderStars = (likes: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < likes ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/50'}`} />
    ));
  };

  return (
    <Card 
      className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
      style={{ background: styles.secondary_color }}
    >
      <CardHeader className="p-0 relative">
        {styles.show_images && (
            <div className="relative aspect-[4/3] w-full">
            <Image
                src={dish.imageUrl}
                alt={dish.name}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
                data-ai-hint={`${dish.category} food`}
            />
            </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 flex flex-col flex-grow text-center">
         {dish.stock === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">Agotado</Badge>
          )}
        <CardTitle className="text-lg font-bold" style={{ color: styles.text_color }}>{dish.name}</CardTitle>
        
        {styles.show_ratings && dish.likes > 0 && (
            <div className="flex items-center justify-center gap-1 mt-1">
                {renderStars(dish.likes)}
                <span className="text-xs text-muted-foreground">({dish.likes})</span>
            </div>
        )}

        <p className="text-sm text-muted-foreground my-2 flex-grow">{dish.description}</p>
        
        <p className="text-xl font-bold" style={{ color: styles.price_color }}>
            ${dish.price.toFixed(2)}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
          <Button 
            onClick={() => onAddToCart(dish)} 
            disabled={dish.stock === 0}
            className="text-white w-full"
            style={{ backgroundColor: styles.primary_color }}
            size="sm"
          >
            {dish.stock === 0 ? <XCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {dish.stock === 0 ? 'No disponible' : 'Agregar'}
          </Button>
      </CardFooter>
    </Card>
  );
}
