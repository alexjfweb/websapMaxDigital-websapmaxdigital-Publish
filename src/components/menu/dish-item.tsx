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
}

export default function DishItem({ dish, onAddToCart }: DishItemProps) {
  const renderStars = (likes: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < likes ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`} />
    ));
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <div className="relative w-full h-48">
        <Image
          src={dish.imageUrl}
          alt={dish.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={`${dish.category} food`}
        />
        {dish.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl leading-tight">{dish.name}</CardTitle>
        <div className="flex items-center gap-1 mt-1">
          {renderStars(dish.likes)}
          <span className="text-xs text-muted-foreground">({dish.likes})</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-3">{dish.description}</CardDescription>
        <p className="text-lg font-semibold text-primary">${dish.price.toFixed(2)}</p>
        {dish.stock > 0 && dish.stock < 10 && (
          <p className="text-xs text-destructive mt-1">Only {dish.stock} left in stock!</p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onAddToCart(dish)} 
          disabled={dish.stock === 0}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {dish.stock === 0 ? <XCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          {dish.stock === 0 ? 'Unavailable' : 'Add to Order'}
        </Button>
      </CardFooter>
    </Card>
  );
}
