'use client';

import * as React from 'react';
import Image from 'next/image';
import { mockRestaurantProfile, mockDishes } from '@/lib/mock-data';
import type { Dish, CartItem, RestaurantProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MinusCircle, PlusCircle, ShoppingCart, Star, MessageSquare, Copy, CreditCard, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RestaurantInfoDisplay from '@/components/menu/restaurant-info-display';
import OrderForm from '@/components/forms/order-form';
import ReservationForm from '@/components/forms/reservation-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DishItem from '@/components/menu/dish-item';
import CartSummary from '@/components/menu/cart-summary';

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


export default function MenuPage() {
  const restaurant = mockRestaurantProfile;
  const dishes = mockDishes;
  const { toast } = useToast();
  const cart = useCart();

  const categories = React.useMemo(() => {
    const uniqueCategories = new Set<string>();
    dishes.forEach(dish => uniqueCategories.add(dish.category));
    return ['All', ...Array.from(uniqueCategories)];
  }, [dishes]);

  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');

  const filteredDishes = React.useMemo(() => {
    if (selectedCategory === 'All') {
      return dishes;
    }
    return dishes.filter(dish => dish.category === selectedCategory);
  }, [dishes, selectedCategory]);


  return (
    <div className="container mx-auto py-8 px-4">
      <RestaurantInfoDisplay restaurant={restaurant} />
      <Separator className="my-8" />

      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 mb-6">
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="order_form">Order Details</TabsTrigger>
          <TabsTrigger value="reserve_form">Reserve Table</TabsTrigger>
          <TabsTrigger value="payment" className="hidden md:inline-flex">Payment Info</TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Dishes Section */}
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Menu</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category)}
                      className="rounded-full"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDishes.map((dish) => (
                  <DishItem key={dish.id} dish={dish} onAddToCart={() => cart.addItem(dish)} />
                ))}
                {filteredDishes.length === 0 && <p>No dishes found in this category.</p>}
              </div>
            </div>

            {/* Cart Summary Section */}
            <div className="w-full md:w-1/3 md:sticky md:top-20 self-start">
              <CartSummary cart={cart} restaurantPhone={restaurant.phone} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="order_form">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Complete Your Order</CardTitle>
                    <CardDescription>Please provide your details to finalize the order.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OrderForm />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="reserve_form">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Reserve Your Table</CardTitle>
                    <CardDescription>Book a table in advance. We look forward to serving you!</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReservationForm />
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="payment" className="hidden md:block">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>We offer the following payment methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {restaurant.paymentMethods.nequi && (
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <Smartphone className="h-6 w-6 mr-2 text-primary" /> Nequi
                  </h3>
                  <p className="text-muted-foreground mb-1">Account Holder: {restaurant.paymentMethods.nequi.accountHolder}</p>
                  <p className="text-muted-foreground mb-2">Account Number: {restaurant.paymentMethods.nequi.accountNumber}</p>
                  <div className="flex justify-center">
                    <Image 
                      src={restaurant.paymentMethods.nequi.qrCodeUrl} 
                      alt="Nequi QR Code" 
                      width={200} 
                      height={200} 
                      className="rounded-md border shadow-sm"
                      data-ai-hint="QR code payment"
                    />
                  </div>
                </div>
              )}
              {restaurant.paymentMethods.cod && (
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <CreditCard className="h-6 w-6 mr-2 text-primary" /> Cash on Delivery (COD)
                  </h3>
                  <p className="text-muted-foreground">Pay with cash when your order arrives.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
