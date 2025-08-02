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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { reservationService } from "@/services/reservation-service"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const reservationFormSchema = z.object({
  fullName: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  phoneNumber: z.string().regex(/^\d{10}$/, { message: "Por favor, ingrese un número de teléfono válido de 10 dígitos." }),
  email: z.string().email({ message: "Por favor, ingrese un correo electrónico válido." }),
  numberOfGuests: z.coerce.number().min(1, { message: "La reserva debe ser para al menos 1 persona." }).max(20, { message: "Para grupos de más de 20, por favor llámenos." }),
  reservationDate: z.date({ required_error: "Se requiere una fecha para la reserva." }),
  reservationTime: z.string({ required_error: "Se requiere una hora para la reserva." }),
  specialRequests: z.string().optional(),
})

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


export default function ReservationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const form = useForm<z.infer<typeof reservationFormSchema>>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      numberOfGuests: 1,
      specialRequests: "",
    },
  })

  async function onSubmit(values: z.infer<typeof reservationFormSchema>) {
    setIsSubmitting(true);
    if (!restaurantId) {
        toast({ title: 'Error', description: 'No se pudo identificar el restaurante.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }
    
    const combinedDateTime = new Date(values.reservationDate);
    const [hours, minutes] = values.reservationTime.split(':').map(Number);
    combinedDateTime.setHours(hours, minutes);

    try {
        await reservationService.createReservation({
            companyId: restaurantId,
            customerName: values.fullName,
            customerPhone: values.phoneNumber,
            dateTime: combinedDateTime.toISOString(),
            numberOfGuests: values.numberOfGuests,
            status: 'pending',
            notes: values.specialRequests,
        });

        toast({
            title: "¡Reserva Solicitada!",
            description: "Hemos enviado tu solicitud de reserva. Recibirás una confirmación pronto.",
        });
        form.reset();
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="fullName"
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
            name="phoneNumber"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
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
          name="specialRequests"
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
           {isSubmitting ? 'Enviando...' : 'Solicitar Reserva'}
        </Button>
      </form>
    </Form>
  )
}
