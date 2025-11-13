import * as React from 'react';
import type { CartItem, Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MinusCircle, PlusCircle, ShoppingCart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import WhatsAppIcon from '@/components/icons/whatsapp-icon';
import { useOrderContext } from '@/contexts/order-context';


interface CartStore {
  items: CartItem[];
  addItem: (dish: CartItem) => void; // Dish is actually CartItem here for simplicity of passing
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

interface CartSummaryProps {
  cart: CartStore;
  restaurantPhone: string;
}

export default function CartSummary({ cart, restaurantPhone }: CartSummaryProps) {
  const { toast } = useToast();
  const { addOrder } = useOrderContext();

  const handleSendOrderViaWhatsApp = () => {
    if (cart.items.length === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'El carrito está vacío',
        variant: "destructive",
      });
      return;
    }

    const newOrder: Omit<Order, 'id' | 'date'> = {
      customerName: 'Cliente Web', // Puedes mejorar esto con datos reales del formulario
      items: cart.totalItems,
      total: cart.totalPrice,
      status: 'pending',
      type: 'delivery', // O 'pickup', según preferencia
      restaurantId: '', // Esto deberá ser llenado con el ID real del restaurante
      productos: [], // Deberás mapear cart.items aquí
      cliente: {
          nombre: 'Cliente Web',
          telefono: 'N/A',
          direccion: 'N/A',
      },
    };
    addOrder(newOrder);

    let message = `Hello websapMax Restaurant! I'd like to place the following order:\n\n`;
    cart.items.forEach(item => {
      message += `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\nTotal: $${cart.totalPrice.toFixed(2)}`;
    message += `\n\nI will provide my contact and delivery details in the next message.`;

    const whatsappUrl = `https://wa.me/${restaurantPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast({
      title: 'Pedido preparado',
      description: 'El pedido se ha enviado correctamente',
    });
  };
  
  // Need mockRestaurantProfile for the name in WhatsApp message
  const mockRestaurantProfile = { name: "websapMax Restaurant" };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-primary">
          <ShoppingCart className="h-7 w-7" /> Carrito
        </CardTitle>
        <CardDescription>Resumen de tu pedido</CardDescription>
      </CardHeader>
      <CardContent>
        {cart.items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">El carrito está vacío</p>
        ) : (
          <>
            <ScrollArea className="h-[300px] pr-3 mb-4">
              <ul className="space-y-3">
                {cart.items.map(item => (
                  <li key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-md border bg-card/50">
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                      <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint="food item" />
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} c/u</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}>
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}>
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => cart.removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">${cart.totalPrice.toFixed(2)}</span>
              </div>
              {/* Add tax/delivery fee calculation if needed */}
              <div className="flex justify-between font-semibold text-lg text-primary">
                <span>Total</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button 
            onClick={handleSendOrderViaWhatsApp} 
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            disabled={cart.items.length === 0}
        >
          <WhatsAppIcon className="mr-2 h-4 w-5" /> Enviar pedido
        </Button>
        {cart.items.length > 0 && (
            <Button variant="outline" onClick={cart.clearCart} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" /> Vaciar carrito
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
