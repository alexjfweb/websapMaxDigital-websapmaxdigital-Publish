'use client';

import * as React from 'react';
import Image from 'next/image';
import { mockRestaurantProfile, mockDishes } from '@/lib/mock-data';
import type { Dish, CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Smartphone, CreditCard, LoaderCircle, ShoppingCart } from 'lucide-react';
import RestaurantInfoDisplay from '@/components/menu/restaurant-info-display';
import OrderForm from '@/components/forms/order-form';
import ReservationForm from '@/components/forms/reservation-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DishItem from '@/components/menu/dish-item';
import CartCheckout from '@/components/menu/cart-checkout';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

// Cart Hook (simple version for now)
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
      return [...prevItems, { ...dish, quantity: 1 }];
    });
  };

  const removeItem = (dishId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== dishId));
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === dishId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0) // Remove if quantity is 0
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
  primary_color: '#FF6600',
  secondary_color: '#FFF6F0',
  text_color: '#222222',
  price_color: '#FF6600',
  font_family: 'sans-serif',
  font_size: 16,
  layout_style: 'list',
  show_images: true,
  show_ratings: true,
  show_whatsapp_button: true,
  spacing: 16,
};

const RESTAURANT_ID = 'websapmax';

export default function MenuPage() {
  const restaurant = mockRestaurantProfile;
  const [dishes, setDishes] = React.useState<Dish[]>([]);
  const cart = useCart();
  const [isMounted, setIsMounted] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [menuStyles, setMenuStyles] = React.useState(defaultMenuStyles);

  React.useEffect(() => {
    setIsMounted(true);
    // Leer todos los platos de Firestore sin filtrar por companyId
    const q = query(collection(db, 'dishes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📊 Firestore snapshot:', snapshot.docs.length, 'documentos encontrados');
      
      const dishesFS = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🍽️ Plato encontrado:', doc.id, data);
        
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          price: typeof data.price === 'number' ? data.price : 0,
          imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
          stock: typeof data.stock === 'number' ? data.stock : -1,
          likes: typeof data.likes === 'number' ? data.likes : 0,
          category: data.category || 'Sin categoría',
          isFeatured: data.isFeatured || false,
        };
      });
      
      console.log('✅ Platos procesados:', dishesFS.length, dishesFS);
      setDishes(dishesFS);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    // Leer estilos personalizados
    const fetchMenuStyles = async () => {
      try {
        const ref = doc(db, 'menu_styles', RESTAURANT_ID);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setMenuStyles({ ...defaultMenuStyles, ...snap.data() });
        }
      } catch (e) {
        // Si falla, usar estilos por defecto
        setMenuStyles(defaultMenuStyles);
      }
    };
    fetchMenuStyles();
  }, []);

  // Categorías dinámicas según los platos en Firestore
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

  if (!isMounted) {
    return (
        <div className="flex min-h-[calc(100vh-theme(spacing.16))] w-full items-center justify-center bg-background">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div
      style={{
        background: menuStyles.secondary_color,
        color: menuStyles.text_color,
        fontFamily: menuStyles.font_family,
        fontSize: menuStyles.font_size,
        minHeight: '100vh',
      }}
    >
      {/* Ícono de carrito en la parte superior derecha */}
      <div className="absolute right-4 top-4 z-30">
        <Dialog open={cartOpen} onOpenChange={setCartOpen}>
          <DialogTrigger asChild>
            <button className="relative p-2 rounded-full bg-white shadow hover:bg-primary/10 transition">
              <ShoppingCart className="h-7 w-7 text-primary" />
              {cart.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border border-white">{cart.totalItems}</span>
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg w-full p-0 bg-transparent border-none shadow-none">
            <h2 className="sr-only">Carrito de compras</h2>
            <CartCheckout
              cart={cart.items}
              onQuantity={(id, delta) => cart.updateQuantity(id, (cart.items.find(i => i.id === id)?.quantity || 1) + delta)}
              onRemove={cart.removeItem}
              onClear={cart.clearCart}
              restaurantId={restaurant.id}
              onClose={() => setCartOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <RestaurantInfoDisplay restaurant={restaurant} />
      <Separator className="my-8" />

      <div className="flex flex-col md:flex-row gap-8 mt-8 justify-center items-start">
        {/* Dishes Section */}
        <div className="w-full md:w-2/3 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-primary text-center">Menú</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-center">Categorías</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {getCategoryLabel(category)}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {filteredDishes.map((dish) => (
              <DishItem key={dish.id} dish={dish} onAddToCart={() => cart.addItem(dish)} />
            ))}
            {filteredDishes.length === 0 && <p>No se encontraron platos</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
