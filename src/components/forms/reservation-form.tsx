
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, CreditCard, User, Clock, Phone, Mail, MessageSquare, CheckCircle, ArrowRight, Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { reservationService } from "@/services/reservation-service"
import { useState, useMemo } from "react"
import { Loader2 } from "lucide-react"
import type { Company } from "@/types"
import NequiIcon from "@/components/icons/nequi-icon"
import DaviplataIcon from "@/components/icons/daviplata-icon"
import BancolombiaIcon from "@/components/icons/bancolombia-icon"
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import WhatsAppIcon from "@/components/icons/whatsapp-icon"

const reservationFormSchema = z.object({
  customerName: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  customerPhone: z.string().regex(/^\d{10}$/, { message: "Por favor, ingrese un número de teléfono válido de 10 dígitos." }),
  customerEmail: z.string().email({ message: "Por favor, ingrese un correo electrónico válido." }).optional().or(z.literal('')),
  numberOfGuests: z.coerce.number().min(1, { message: "La reserva debe ser para al menos 1 persona." }).max(20, { message: "Para grupos de más de 20, por favor llámenos." }),
  reservationDate: z.date({ required_error: "Se requiere una fecha para la reserva." }),
  reservationTime: z.string({ required_error: "Se requiere una hora para la reserva." }),
  paymentMethod: z.string({ required_error: "Debe seleccionar un método de pago." }),
  notes: z.string().optional(),
})

type ReservationFormData = z.infer<typeof reservationFormSchema>;

// Generar franjas horarias (ej. cada 30 minutos de 12 PM a 9 PM)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 12; hour <= 21; hour++) { // De 12:00 a 21:00
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};
const timeSlots = generateTimeSlots();


export default function ReservationForm({ restaurantId, restaurantProfile, onSuccess }: { 
    restaurantId: string; 
    restaurantProfile: Company | null;
    onSuccess?: () => void; 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationFormData | null>(null);

  const paymentMethods = useMemo(() => {
    const methods = [];
    if (!restaurantProfile?.paymentMethods) return [];

    if (restaurantProfile.paymentMethods.nequi?.enabled) {
      methods.push({ key: 'nequi', label: 'Nequi', icon: <NequiIcon className="h-5 w-5" /> });
    }
    if (restaurantProfile.paymentMethods.daviplata?.enabled) {
      methods.push({ key: 'daviplata', label: 'Daviplata', icon: <DaviplataIcon className="h-5 w-5" /> });
    }
    if (restaurantProfile.paymentMethods.bancolombia?.enabled && restaurantProfile.paymentMethods.bancolombia.bancolombiaQrImageUrl) {
      methods.push({ key: 'bancolombia_qr', label: 'Bancolombia QR', icon: <BancolombiaIcon className="h-5 w-5" /> });
    }
    return methods;
  }, [restaurantProfile]);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      numberOfGuests: 1,
      paymentMethod: "",
      notes: "",
    },
  })

  const selectedPaymentMethod = form.watch("paymentMethod");

  async function onValidSubmit(values: ReservationFormData) {
    setReservationData(values);
    setIsConfirmModalOpen(true);
  }
  
  async function handleConfirmAndSend() {
    if (!reservationData) return;
    setIsSubmitting(true);

    if (!restaurantId) {
      toast({ title: 'Error', description: 'No se pudo identificar el restaurante.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const combinedDateTime = new Date(reservationData.reservationDate);
    const [hours, minutes] = reservationData.reservationTime.split(':').map(Number);
    combinedDateTime.setHours(hours, minutes);

    try {
        await reservationService.createReservation({
            restaurantId: restaurantId,
            customerName: reservationData.customerName,
            customerPhone: reservationData.customerPhone,
            customerEmail: reservationData.customerEmail || undefined,
            dateTime: combinedDateTime.toISOString(),
            numberOfGuests: reservationData.numberOfGuests,
            paymentMethod: reservationData.paymentMethod,
            notes: reservationData.notes || '',
        });

        // Preparamos el mensaje de WhatsApp
        const paymentMethodLabel = paymentMethods.find(p => p.key === reservationData.paymentMethod)?.label || 'No especificado';
        const message = `✨ *Nueva Solicitud de Reserva* ✨\n\n` +
                        `*Restaurante:* ${restaurantProfile?.name}\n\n` +
                        `*Cliente:* ${reservationData.customerName}\n` +
                        `*Teléfono:* ${reservationData.customerPhone}\n` +
                        `*Fecha:* ${format(combinedDateTime, "EEEE, d 'de' MMMM", { locale: es })}\n` +
                        `*Hora:* ${reservationData.reservationTime}\n` +
                        `*Invitados:* ${reservationData.numberOfGuests}\n` +
                        `*Pago:* ${paymentMethodLabel}\n\n` +
                        `${reservationData.notes ? `*Notas:* ${reservationData.notes}\n` : ''}` +
                        `_Solicitud enviada a través de WebSapMax._`;
        
        const whatsappUrl = `https://wa.me/${restaurantProfile?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        toast({
            title: "¡Reserva Solicitada!",
            description: "Hemos enviado tu solicitud. Te redirigimos a WhatsApp para confirmar.",
        });
        form.reset();
        setIsConfirmModalOpen(false);
        if (onSuccess) onSuccess();

    } catch(error) {
        console.error("Error al crear la reserva:", error);
        toast({
            title: "Error al Reservar",
            description: "No pudimos procesar tu reserva. Por favor, intenta de nuevo.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  }


  const renderPaymentDetails = () => {
    if (!selectedPaymentMethod) return null;

    const pm = restaurantProfile?.paymentMethods;

    if (selectedPaymentMethod === 'nequi' && pm?.nequi?.enabled) {
      return (
        <div className="mt-4 p-3 bg-muted rounded-md border text-sm">
          <p><strong>Pagar a Nequi:</strong> {pm.nequi.accountNumber}</p>
          <p><strong>Titular:</strong> {pm.nequi.accountHolder}</p>
        </div>
      );
    }
    if (selectedPaymentMethod === 'daviplata' && pm?.daviplata?.enabled) {
      return (
        <div className="mt-4 p-3 bg-muted rounded-md border text-sm">
          <p><strong>Pagar a Daviplata:</strong> {pm.daviplata.accountNumber}</p>
          <p><strong>Titular:</strong> {pm.daviplata.accountHolder}</p>
        </div>
      );
    }
    if (selectedPaymentMethod === 'bancolombia_qr' && pm?.bancolombia?.enabled && pm.bancolombia.bancolombiaQrImageUrl) {
        return (
            <div className="mt-4 p-3 bg-muted rounded-md border text-center">
                <p className="font-semibold mb-2">Escanea para pagar con Bancolombia</p>
                <Image 
                    src={pm.bancolombia.bancolombiaQrImageUrl}
                    alt="Código QR Bancolombia"
                    width={150}
                    height={150}
                    className="mx-auto rounded-lg"
                    data-ai-hint="payment QR code"
                />
            </div>
        )
    }

    return null;
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: Ana Pérez" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Número de Teléfono</FormLabel>
                <FormControl>
                    <Input type="tel" placeholder="Ej: 3001234567" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico (Opcional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ana.perez@correo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-3 gap-6">
            <FormField
            control={form.control}
            name="numberOfGuests"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Número de Invitados</FormLabel>
                <FormControl>
                    <Input type="number" min="1" max="20" placeholder="2" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="reservationDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Fecha de Reserva</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP", { locale: es })
                        ) : (
                            <span>Elige una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                            date < new Date(new Date().setHours(0,0,0,0)) // Deshabilitar fechas pasadas
                        }
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="reservationTime"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Hora de Reserva</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Elige una hora" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {timeSlots.map(slot => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pago</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un método de pago" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map(method => (
                     <SelectItem key={method.key} value={method.key}>
                        <div className="flex items-center gap-2">
                            {method.icon}
                            <span>{method.label}</span>
                        </div>
                     </SelectItem>
                  ))}
                  {paymentMethods.length === 0 && <SelectItem value="no-methods" disabled>No hay métodos de pago online</SelectItem>}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {renderPaymentDetails()}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solicitudes Especiales (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: mesa junto a la ventana, celebración de cumpleaños" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
           {isSubmitting ? 'Procesando...' : 'Solicitar Reserva'}
        </Button>
      </form>
    </Form>

    <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Confirmar tu Reserva</DialogTitle>
            <DialogDescription className="text-center">
              Revisa los detalles de tu reserva antes de confirmar.
            </DialogDescription>
          </DialogHeader>
          {reservationData && (
             <div className="space-y-3 my-4">
                <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <span className="font-semibold text-muted-foreground flex items-center gap-2"><User className="h-4 w-4"/>Cliente</span>
                    <span className="font-medium text-right">{reservationData.customerName}</span>
                </div>
                 <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <span className="font-semibold text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4"/>Teléfono</span>
                    <span className="font-medium text-right">{reservationData.customerPhone}</span>
                </div>
                 <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <span className="font-semibold text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4"/>Invitados</span>
                    <span className="font-medium text-right">{reservationData.numberOfGuests}</span>
                </div>
                 <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <span className="font-semibold text-muted-foreground flex items-center gap-2"><CalendarIcon className="h-4 w-4"/>Fecha y Hora</span>
                    <span className="font-medium text-right">
                        {format(reservationData.reservationDate, "d MMM, yyyy", { locale: es })} a las {reservationData.reservationTime}
                    </span>
                </div>
                {reservationData.notes && (
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-semibold text-muted-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4"/>Notas</span>
                    <p className="font-medium text-sm mt-1">{reservationData.notes}</p>
                  </div>
                )}
             </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
             <Button 
                onClick={handleConfirmAndSend} 
                disabled={isSubmitting} 
                className="w-full bg-green-500 hover:bg-green-600 text-lg py-6"
             >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <WhatsAppIcon className="mr-2 h-5 w-5" />}
                {isSubmitting ? 'Confirmando...' : 'Confirmar y Enviar por WhatsApp'}
             </Button>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)} disabled={isSubmitting}>
                Volver y Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
