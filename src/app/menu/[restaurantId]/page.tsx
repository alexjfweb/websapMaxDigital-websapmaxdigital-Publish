

'use client';

import * as React from 'react';
import Image from 'next/image';
import type { Company, Dish, CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LoaderCircle, ShoppingCart, CalendarCheck, Sparkles, X, Plus } from 'lucide-react';
import RestaurantInfoDisplay from '@/components/menu/restaurant-info-display';
import DishItem from '@/components/menu/dish-item';
import CartCheckout from '@/components/menu/cart-checkout';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import ReservationForm from '@/components/forms/reservation-form';
import { useDishes } from '@/hooks/use-dishes';
import { getProductSuggestion } from '@/ai/flows/suggestion-flow';
import type { SuggestionRequest, SuggestionResponse } from '@/ai/schemas/suggestion-schemas';
import { useToast } from '@/hooks/use-toast';

interface CartStore {
  items: CartItem[];
  addItem: (dish: Dish) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const useCart = (): CartStore => {
  const [items, setItems] = React.useState<CartItem[]>([]);

  const addItem = (dish: Dish) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === dish.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...dish, quantity: 1, imageUrl: dish.imageUrl }];
    });
  };

  const removeItem = (dishId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== dishId));
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === dishId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0)
    );
  };
  
  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = React.useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const totalItems = React.useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return { items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems };
};

const defaultMenuStyles = {
  primary_color: '#FF4500',
  secondary_color: '#FFF6F0',
  text_color: '#222222',
  price_color: '#FF6600',
  font_family: 'sans-serif',
  font_size: 16,
  layout_style: 'grid', 
  show_images: true,
  show_ratings: true,
  show_whatsapp_button: true,
  spacing: 16,
};

export default function MenuPage({ params }: { params: { restaurantId: string } }) {
  const { restaurantId } = params;
  const [restaurant, setRestaurant] = React.useState<Company | null>(null);
  const cart = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [reservationOpen, setReservationOpen] = React.useState(false);
  const [menuStyles, setMenuStyles] = React.useState(defaultMenuStyles);
  
  const { dishes, isLoading: isLoadingDishes, error: errorDishes } = useDishes(restaurantId);

  // Estados para el modal de sugerencias
  const [isSuggestionLoading, setIsSuggestionLoading] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<SuggestionResponse | null>(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!restaurantId) {
      setError("ID de restaurante no válido.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const fetchRestaurantData = async () => {
      const db = getDb();
      try {
        const companyDocRef = doc(db, "companies", restaurantId);
        const companySnapshot = await getDoc(companyDocRef);

        if (!companySnapshot.exists()) {
            setError("No se pudo encontrar el restaurante.");
            setIsLoading(false);
            return;
        }

        const companyData = { ...companySnapshot.data(), id: companySnapshot.id } as Company;
        
        setRestaurant(companyData);

        const stylesRef = doc(db, 'menu_styles', restaurantId);
        const stylesSnap = await getDoc(stylesRef);
        if (stylesSnap.exists()) {
          setMenuStyles({ ...defaultMenuStyles, ...stylesSnap.data() });
        }

      } catch (e) {
        console.error("Error cargando datos del restaurante:", e);
        setError("Error al cargar la información del restaurante.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurantData();

  }, [restaurantId]);


  const categories = React.useMemo(() => {
    const uniqueCategories = new Set<string>();
    dishes.forEach(dish => uniqueCategories.add(dish.category));
    return ['ALL', ...Array.from(uniqueCategories)];
  }, [dishes]);

  const getCategoryLabel = (category: string) => {
    if (category === 'ALL') return 'Todos';
    return category;
  };

  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');

  const filteredDishes = React.useMemo(() => {
    if (selectedCategory === 'ALL') {
      return dishes;
    }
    return dishes.filter(dish => dish.category === selectedCategory);
  }, [dishes, selectedCategory]);

  const handleAddToCart = async (dish: Dish) => {
    // 1. Añadir al carrito inmediatamente para una buena experiencia de usuario
    cart.addItem(dish);
    toast({
        title: "¡Añadido!",
        description: `${dish.name} se ha añadido a tu carrito.`,
    });

    // 2. Activar la carga de la sugerencia
    setIsSuggestionLoading(true);
    
    try {
        const now = new Date();
        const request: SuggestionRequest = {
            companyId: restaurantId,
            initialDishId: dish.id, // CORREGIDO: Usar el ID del plato
            currentTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        };

        console.log("Enviando solicitud de sugerencia:", request); // Log para depuración
        const result = await getProductSuggestion(request);
        console.log("Respuesta de sugerencia recibida:", result); // Log para depuración

        // 3. Si hay una sugerencia válida, mostrarla
        if (result && result.suggestionType !== 'none' && result.suggestedProduct) {
            setSuggestion(result);
            setIsSuggestionModalOpen(true);
        }

    } catch (e: any) {
        console.error("Error obteniendo sugerencia:", e);
        // No mostrar un toast de error al usuario, para no interrumpir su flujo.
    } finally {
        setIsSuggestionLoading(false);
    }
  };

  const handleAddSuggestedItem = () => {
    if (suggestion?.suggestedProduct) {
        // Buscar el plato completo en la lista de platos
        const suggestedDish = dishes.find(d => d.name.toLowerCase() === suggestion.suggestedProduct!.toLowerCase());
        if (suggestedDish) {
            cart.addItem(suggestedDish);
            toast({
                title: "¡Producto Sugerido Añadido!",
                description: `${suggestedDish.name} también se ha añadido a tu carrito.`,
            });
        } else {
             toast({
                title: "Producto no encontrado",
                description: "No pudimos encontrar el producto sugerido en el menú actual.",
                variant: 'destructive'
            });
        }
    }
    setIsSuggestionModalOpen(false);
    setSuggestion(null);
  };
  

  if (isLoading) {
    return (
        <div className="flex min-h-[calc(100vh-theme(spacing.16))] w-full items-center justify-center bg-background">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] w-full items-center justify-center bg-background">
        <div className="text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Error al cargar el menú</h2>
            <p className="text-muted-foreground">{error || "No se encontró la información del restaurante."}</p>
        </div>
      </div>
    );
  }

  const restaurantInfoForDisplay = { ...restaurant, address: restaurant.addressStreet, logoUrl: restaurant.logoUrl, bannerUrl: restaurant.bannerUrl };

  return (
    <>
      <Dialog open={isSuggestionModalOpen} onOpenChange={setIsSuggestionModalOpen}>
        <DialogContent className="max-w-sm">
            <DialogHeader className="text-center items-center">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                    <Sparkles className="h-8 w-8 text-primary"/>
                </div>
                <DialogTitle className="text-xl">{suggestion?.message || 'Sugerencia Especial'}</DialogTitle>
                <DialogDescription>
                  ¡Tenemos una recomendación para ti!
                </DialogDescription>
            </DialogHeader>
            {suggestion?.suggestedProduct && (
                 <div className="flex flex-col items-center gap-4 py-4">
                    <Image 
                        src={dishes.find(d => d.name.toLowerCase() === suggestion.suggestedProduct!.toLowerCase())?.imageUrl || "https://placehold.co/150x150.png"}
                        alt={suggestion.suggestedProduct}
                        width={150}
                        height={150}
                        className="rounded-lg object-cover shadow-md"
                        data-ai-hint="suggested food item"
                    />
                    <p className="text-lg font-bold">{suggestion.suggestedProduct}</p>
                </div>
            )}
            <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                <Button onClick={handleAddSuggestedItem}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Sí, ¡añadir al carrito!
                </Button>
                <Button variant="outline" onClick={() => setIsSuggestionModalOpen(false)}>
                    No, gracias
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>


    <div
      style={{
        background: menuStyles.secondary_color,
        color: menuStyles.text_color,
        fontFamily: menuStyles.font_family,
        fontSize: `${menuStyles.font_size}px`,
      }}
      className="min-h-screen"
    >
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-4">
        <Dialog open={cartOpen} onOpenChange={setCartOpen}>
          <DialogTrigger asChild>
            <button className="relative p-2 rounded-full bg-white shadow-lg hover:bg-primary/10 transition hover:scale-110 active:scale-95">
              <ShoppingCart className="h-7 w-7 text-primary" />
              {cart.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-green-500 text-white text-xs rounded-full font-bold border-2 border-white">
                  {cart.totalItems}
                </span>
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg w-full p-0 bg-transparent border-none shadow-none">
            <h2 className="sr-only">Carrito de compras</h2>
            <CartCheckout
              cart={cart.items}
              onQuantity={(id, delta) => cart.updateQuantity(id, (cart.items.find(i => i.id === id)?.quantity || 0) + delta)}
              onRemove={cart.removeItem}
              onClear={cart.clearCart}
              restaurantId={restaurantId}
              restaurantProfile={restaurant}
              onClose={() => setCartOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={reservationOpen} onOpenChange={setReservationOpen}>
            <DialogTrigger asChild>
                <button className="p-2 rounded-full bg-white shadow-lg hover:bg-primary/10 transition hover:scale-110 active:scale-95">
                    <CalendarCheck className="h-7 w-7 text-primary" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Hacer una reserva</DialogTitle>
                    <DialogDescription>
                        Completa el siguiente formulario para asegurar tu mesa.
                    </DialogDescription>
                </DialogHeader>
                {restaurantId && (
                  <ReservationForm 
                      restaurantId={restaurantId}
                      restaurantProfile={restaurant}
                      onSuccess={() => setReservationOpen(false)}
                  />
                )}
            </DialogContent>
        </Dialog>
      </div>
      
      <RestaurantInfoDisplay restaurant={restaurantInfoForDisplay} />
      
      <Separator className="my-8" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: menuStyles.primary_color }}>Menú</h2>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-center" style={{ color: menuStyles.primary_color }}>Categorías</h3>
          <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
            {categories.map(category => (
              <Button
                key={category}
                style={selectedCategory === category ? { backgroundColor: menuStyles.primary_color, color: '#fff' } : {}}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full flex-shrink-0"
              >
                {getCategoryLabel(category)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDishes.map((dish) => (
             <DishItem key={dish.id} dish={dish} onAddToCart={() => handleAddToCart(dish)} styles={menuStyles} />
          ))}
          {filteredDishes.length === 0 && !isLoadingDishes && <p>No se encontraron platos en esta categoría.</p>}
        </div>
      </div>
    </div>
    </>
  );
}
