
import * as React from 'react';
import Image from 'next/image';
import type { Dish } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-row items-center"
      style={{ background: styles.secondary_color, borderColor: styles.primary_color }}
    >
      {styles.show_images && (
        <div className="relative w-40 h-full flex-shrink-0">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            layout="fill"
            objectFit="cover"
            className="h-full w-full"
            data-ai-hint={`${dish.category} food`}
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow relative w-full">
         {dish.stock === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">Agotado</Badge>
          )}
        <h3 className="text-lg font-bold" style={{ color: styles.text_color }}>{dish.name}</h3>
        
        {styles.show_ratings && dish.likes > 0 && (
            <div className="flex items-center gap-1 mt-1">
                {renderStars(dish.likes)}
                <span className="text-xs text-muted-foreground">({dish.likes})</span>
            </div>
        )}

        <p className="text-sm text-muted-foreground my-2 flex-grow">{dish.description}</p>
        
        <div className="flex justify-between items-end mt-2">
            <p className="text-xl font-bold" style={{ color: styles.price_color }}>
                ${dish.price.toFixed(2)}
            </p>
            <Button 
              onClick={() => onAddToCart(dish)} 
              disabled={dish.stock === 0}
              className="text-white shrink-0"
              style={{ backgroundColor: styles.primary_color }}
              size="sm"
            >
              {dish.stock === 0 ? <XCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {dish.stock === 0 ? 'No disponible' : 'Agregar'}
            </Button>
        </div>
      </div>
    </Card>
  );
}
