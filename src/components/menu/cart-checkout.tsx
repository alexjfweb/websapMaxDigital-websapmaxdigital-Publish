
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, User, CreditCard, Trash2, Share2, CheckCircle, MinusCircle, PlusCircle, XCircle, Check, Copy } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useOrderContext, type Order } from '@/contexts/order-context';
import { DialogTitle } from '@/components/ui/dialog';
import { tableService, Table } from '@/services/table-service';

// Tipos para los productos del carrito
interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

interface CartCheckoutProps {
  cart: CartItem[];
  onQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  restaurantId: string;
  onClose?: () => void;
}

function validatePhone(phone: string) {
  return /^3\d{9}$/.test(phone.replace(/\D/g, "")); // Ejemplo Colombia
}

const paymentMethods = [
  {
    key: "cash",
    label: "Pago Contra Entrega",
    instructions: "Paga en efectivo al recibir tu pedido. Ten el dinero exacto para agilizar la entrega.",
  },
  {
    key: "qr",
    label: "Paga con Código QR",
    instructions: "Escanea este QR con tu app bancaria para transferir el total.",
    qrUrl: "https://placehold.co/120x120?text=QR",
  },
  {
    key: "nequi",
    label: "Paga con Nequi/Daviplata",
    instructions: "Envía el total a 3001234567 (Nequi/Daviplata).",
  },
  {
    key: "paypal",
    label: "PayPal (Simulado)",
    instructions: "Serás redirigido a una pasarela simulada.",
  },
];

export default function CartCheckout({ cart, onQuantity, onRemove, onClear, restaurantId, onClose }: CartCheckoutProps) {
  const { addOrder } = useOrderContext();
  const envio = cart.length > 0 ? 5.0 : 0;
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + envio;
  const { toast } = useToast ? useToast() : { toast: () => {} };

  // Estado del formulario de cliente
  const [cliente, setCliente] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    correo: "",
    notas: "",
  });
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});

  // Validaciones
  const errors = {
    nombre: cliente.nombre.trim().length < 3 ? "Nombre requerido" : "",
    telefono: !validatePhone(cliente.telefono) ? "Teléfono inválido (Ej: 3001234567)" : "",
    direccion: cliente.direccion.trim().length < 5 ? "Dirección requerida" : "",
    correo: cliente.correo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cliente.correo) ? "Correo inválido" : "",
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const [accordionOpen, setAccordionOpen] = useState<string>('payment');
  const [selectedPayment, setSelectedPayment] = useState<string>("");

  // Estado para mesas
  const [mesas, setMesas] = useState<Table[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string>("");
  const [loadingMesas, setLoadingMesas] = useState(false);

  useEffect(() => {
    setLoadingMesas(true);
    tableService.getAllTables(restaurantId).then((todas) => {
      // Solo mesas activas y disponibles
      setMesas(todas.filter(m => m.isActive && m.status === 'available'));
    }).finally(() => setLoadingMesas(false));
  }, [restaurantId]);

  const handleConfirmAndSend = async () => {
    if (cart.length === 0) {
      toast({ title: 'Carrito vacío', description: 'Agrega productos antes de continuar.', variant: 'destructive' });
      return;
    }
    if (errors.nombre || errors.telefono || errors.direccion || errors.correo) {
      toast({ title: 'Datos incompletos', description: 'Completa correctamente los datos del cliente.', variant: 'destructive' });
      setAccordionOpen('customer');
      return;
    }
    if (!selectedPayment) {
      toast({ title: 'Selecciona método de pago', description: 'Debes elegir una forma de pago para continuar.', variant: 'destructive' });
      setAccordionOpen('payment');
      return;
    }

    let pedidoGuardado = false;
    try {
      const mesaObj = mesas.find(m => m.id === mesaSeleccionada);
      
      const newOrderData: Omit<Order, 'id' | 'date'> = {
        restaurantId,
        productos: cart.map(item => ({ id: item.id, nombre: item.name, cantidad: item.quantity, precio: item.price })),
        cliente: {
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          correo: cliente.correo,
          notas: cliente.notas,
        },
        status: 'pending',
        total,
        // --- Campos calculados que el contexto necesita ---
        customerName: cliente.nombre,
        items: cart.reduce((sum, item) => sum + item.quantity, 0),
        type: mesaObj ? 'dine-in' : 'delivery',
        // --- Mesa ---
        mesa: mesaObj ? {
          tableId: mesaObj.id!,
          tableNumber: mesaObj.number,
        } : undefined,
      };

      await addOrder(newOrderData);
      
      if (mesaObj) {
        await tableService.changeTableStatus(mesaObj.id!, 'occupied');
      }
      pedidoGuardado = true;
    } catch (err) {
      toast({ title: 'Error al registrar pedido', description: 'No se pudo guardar el pedido en el sistema.', variant: 'destructive' });
      return;
    }

    const productos = cart.map(item => `• ${item.quantity}x ${item.name} – $${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const totalStr = (cart.reduce((acc, item) => acc + item.price * item.quantity, 0) + envio).toFixed(2);
    const metodo = paymentMethods.find(m => m.key === selectedPayment)?.label || '';
    const mensaje =
      `🧾 *Nuevo pedido recibido desde WebSapMax*\n\n` +
      `📍 *Dirección de entrega:*  \n${cliente.direccion}\n\n` +
      `🧍 *Cliente:*  \n${cliente.nombre}  \n📞 ${cliente.telefono}  \n${cliente.correo ? `✉ ${cliente.correo}\n` : ''}` +
      `\n🛍️ *Productos solicitados:*  \n${productos}\n\n` +
      `💰 *Total a pagar:*  \n$${totalStr}\n\n` +
      `💳 *Método de pago:*  \n${metodo}\n\n` +
      (cliente.notas ? `📝 *Notas del cliente:*  \n${cliente.notas}` : '');
    const phone = '573001234567';
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    toast({ title: 'Pedido preparado', description: 'Redirigiendo a WhatsApp...', variant: 'success' });
    if (pedidoGuardado) {
      if (onClear) onClear();
      if (onClose) onClose();
    }
  };

  const handleShare = () => {
    if (cart.length === 0) {
      toast({ title: 'Carrito vacío', description: 'No hay productos para compartir.', variant: 'destructive' });
      return;
    }
    const productos = cart.map(item => `- ${item.quantity}x ${item.name} – $${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const total = (cart.reduce((acc, item) => acc + item.price * item.quantity, 0) + envio).toFixed(2);
    const resumen =
      `🛍️ Pedido WebSapMax\n` +
      `Cliente: ${cliente.nombre || '-'}\n` +
      `Tel: ${cliente.telefono || '-'}\n` +
      `Dirección: ${cliente.direccion || '-'}\n` +
      `Productos:\n${productos}\n` +
      `Total: $${total}`;
    navigator.clipboard.writeText(resumen).then(() => {
      toast({ title: 'Pedido copiado', description: 'Resumen copiado al portapapeles.', variant: 'success' });
    }).catch(() => {
      toast({ title: 'Error', description: 'No se pudo copiar el pedido.', variant: 'destructive' });
    });
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] overflow-x-auto">
      <Card className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl p-0 overflow-hidden max-h-[80vh] overflow-y-auto">
        <CardHeader className="bg-primary/5 border-b rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
            <ShoppingCart className="h-7 w-7" /> Tu Carrito
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <DialogTitle className="sr-only">Carrito de compras</DialogTitle>
          <h2 className="sr-only">Resumen del carrito y confirmación de pedido</h2>
          {/* Resumen de productos */}
          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">Tu carrito está vacío</div>
            ) : (
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-white shadow-sm">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      width={56} 
                      height={56} 
                      className="rounded-md object-cover" 
                      style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onQuantity(item.id, -1)}>
                        <MinusCircle className="h-5 w-5" />
                      </Button>
                      <span className="text-base font-medium w-7 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onQuantity(item.id, 1)}>
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                    <span className="font-semibold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(item.id)}>
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Subtotal y total */}
          {cart.length > 0 && (
            <div className="space-y-1 text-base">
              <div className="flex justify-between">
                <span className="font-semibold">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Costo de envío</span>
                <span className="font-semibold">${envio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg text-primary mt-2">
                <span className="font-bold">Total del Pedido</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          )}
          {/* Acordeón principal */}
          <Accordion type="single" collapsible value={accordionOpen} onValueChange={setAccordionOpen} className="rounded-lg border bg-muted/50">
            <AccordionItem value="payment">
              <AccordionTrigger className="text-base font-semibold px-4">Opciones de Pago Disponibles</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex flex-col gap-3">
                  {paymentMethods.map((method) => (
                    <label key={method.key} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedPayment === method.key ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'hover:border-primary/50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.key}
                        checked={selectedPayment === method.key}
                        onChange={() => setSelectedPayment(method.key)}
                        className="accent-primary h-4 w-4"
                      />
                      <span className="flex-1 font-medium">{method.label}</span>
                      {selectedPayment === method.key && <Check className="h-5 w-5 text-green-600" />}
                    </label>
                  ))}
                  {selectedPayment && (
                    <div className="mt-2 p-3 rounded-md bg-muted border text-sm">
                      <div className="font-medium mb-1">Instrucciones:</div>
                      <div className="mb-2">{paymentMethods.find(m => m.key === selectedPayment)?.instructions}</div>
                      {selectedPayment === "qr" && (
                        <img src={paymentMethods.find(m => m.key === "qr")?.qrUrl} alt="QR" className="w-28 h-28 mx-auto rounded" />
                      )}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="customer">
              <AccordionTrigger className="text-base font-semibold px-4">Información del Cliente</AccordionTrigger>
              <AccordionContent>
                <form className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                    <Input
                      name="nombre"
                      value={cliente.nombre}
                      onChange={handleInput}
                      onBlur={handleBlur}
                      placeholder="Ej: Ana Pérez"
                      className={errors.nombre && touched.nombre ? "border-destructive" : ""}
                      required
                    />
                    {errors.nombre && touched.nombre && (
                      <span className="text-xs text-destructive">{errors.nombre}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono *</label>
                    <Input
                      name="telefono"
                      value={cliente.telefono}
                      onChange={handleInput}
                      onBlur={handleBlur}
                      placeholder="Ej: 3001234567"
                      className={errors.telefono && touched.telefono ? "border-destructive" : ""}
                      required
                    />
                    {errors.telefono && touched.telefono && (
                      <span className="text-xs text-destructive">{errors.telefono}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dirección de entrega *</label>
                    <Input
                      name="direccion"
                      value={cliente.direccion}
                      onChange={handleInput}
                      onBlur={handleBlur}
                      placeholder="Ej: Calle 123 #4-56, Bogotá"
                      className={errors.direccion && touched.direccion ? "border-destructive" : ""}
                      required
                    />
                    {errors.direccion && touched.direccion && (
                      <span className="text-xs text-destructive">{errors.direccion}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Correo electrónico (opcional)</label>
                    <Input
                      name="correo"
                      value={cliente.correo}
                      onChange={handleInput}
                      onBlur={handleBlur}
                      placeholder="Ej: ana@email.com"
                      className={errors.correo && touched.correo ? "border-destructive" : ""}
                      type="email"
                    />
                    {errors.correo && touched.correo && (
                      <span className="text-xs text-destructive">{errors.correo}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notas para el vendedor</label>
                    <Textarea
                      name="notas"
                      value={cliente.notas}
                      onChange={handleInput}
                      onBlur={handleBlur}
                      placeholder="Ej: Sin cebolla, por favor"
                      rows={2}
                    />
                  </div>
                </form>
                {/* Selector de mesa */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Mesa (opcional)</label>
                  {loadingMesas ? (
                    <span className="text-muted-foreground text-sm">Cargando mesas...</span>
                  ) : (
                    <select
                      className="w-full border rounded-md p-2 mt-1"
                      value={mesaSeleccionada}
                      onChange={e => setMesaSeleccionada(e.target.value)}
                    >
                      <option value="">Sin mesa (para llevar)</option>
                      {mesas.map(mesa => (
                        <option key={mesa.id} value={mesa.id!}>
                          Mesa {mesa.number} (capacidad: {mesa.capacity})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 p-6 border-t bg-primary/5 rounded-b-2xl">
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-4 rounded-lg flex items-center justify-center gap-2" onClick={handleConfirmAndSend}>
            <CheckCircle className="h-6 w-6" /> Confirmar Pedido y Contactar por WhatsApp
          </Button>
          <div className="flex justify-center w-full">
            <Button variant="outline" className="text-primary border-primary text-lg py-4 rounded-lg mt-1 w-full max-w-xs" onClick={handleShare} disabled={cart.length === 0}>
              <Copy className="mr-2 h-5 w-5" /> Compartir Carrito
            </Button>
          </div>
          <Button variant="outline" className="w-full text-destructive border-destructive text-lg py-4 rounded-lg" onClick={onClear} disabled={cart.length === 0}>
            <Trash2 className="mr-2 h-5 w-5" /> Vaciar Carrito
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
