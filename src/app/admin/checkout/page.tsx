
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePublicLandingPlans } from '@/hooks/use-plans';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, AlertCircle, ArrowLeft, Gem, CreditCard, Banknote, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { companyService } from '@/services/company-service';
import { useSession } from '@/contexts/session-context';

function CheckoutSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-5 w-2/3 mb-10" />
            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const planSlug = searchParams.get('plan');
    const { plans, isLoading, error } = usePublicLandingPlans();
    const { toast } = useToast();
    const { currentUser } = useSession();

    if (isLoading) {
        return <CheckoutSkeleton />;
    }

    if (error || !planSlug) {
        return (
            <div className="text-center py-10">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-lg font-medium">No se pudo cargar el plan</h2>
                <p className="mt-2 text-sm text-muted-foreground">{error?.message || 'El plan solicitado no es válido.'}</p>
                 <Button asChild className="mt-6">
                    <Link href="/admin/subscription">Volver a Suscripciones</Link>
                </Button>
            </div>
        );
    }
    
    const selectedPlan = plans.find(p => p.slug === planSlug);

    if (!selectedPlan) {
        return (
             <div className="text-center py-10">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-lg font-medium">Plan no encontrado</h2>
                <p className="mt-2 text-sm text-muted-foreground">El plan seleccionado no existe o no está disponible.</p>
                <Button asChild className="mt-6">
                    <Link href="/admin/subscription">Volver a Suscripciones</Link>
                </Button>
            </div>
        );
    }
    
    const handleConfirmPayment = async () => {
        if (!currentUser || !currentUser.companyId) {
            toast({ title: "Error", description: "No se pudo identificar tu empresa.", variant: "destructive"});
            return;
        }
        
        try {
            // Este es el flujo manual. Cambiamos el estado para que el superadmin verifique.
            await companyService.updateCompany(currentUser.companyId, {
                subscriptionStatus: 'pending_payment',
                planId: selectedPlan.id
            }, currentUser);
            
            toast({
                title: "¡Confirmación Enviada!",
                description: "Hemos notificado al administrador. Tu plan será activado una vez se verifique el pago.",
            });
            // En un futuro, aquí se redirigiría a una página de "pago pendiente".
            // Por ahora, lo dejamos en la misma página.
            
        } catch(e: any) {
             toast({ title: "Error", description: `No se pudo actualizar el estado de la suscripción: ${e.message}`, variant: "destructive"});
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="mb-8">
                 <Button variant="ghost" asChild className="mb-4">
                    <Link href="/admin/subscription">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a los planes
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Gem className="h-8 w-8" />
                    Confirmar Cambio de Plan
                </h1>
                <p className="text-lg text-muted-foreground mt-1">Estás a punto de mejorar tu suscripción. Revisa los detalles y confirma.</p>
            </div>

            <div className="grid md:grid-cols-5 gap-10">
                <div className="md:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen de tu Nuevo Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <Badge className={`${selectedPlan.isPopular ? 'bg-yellow-400 text-yellow-900' : ''}`}>{selectedPlan.name}</Badge>
                                    <p className="text-muted-foreground">{selectedPlan.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">${selectedPlan.price}</p>
                                    <p className="text-sm text-muted-foreground">/ {selectedPlan.period === 'monthly' ? 'mes' : 'año'}</p>
                                </div>
                            </div>
                            <ul className="space-y-2 text-sm">
                                {selectedPlan.features.map((feature: string, index: number) => (
                                    <li key={index} className="flex items-center">
                                        <Check className="h-4 w-4 mr-2 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5"/>¿Cómo funciona?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                           <p>1. <strong>Elige tu método de pago</strong> y sigue las instrucciones que se muestran.</p>
                           <p>2. <strong>Realiza el pago</strong> desde tu aplicación bancaria o plataforma preferida.</p>
                           <p>3. <strong>Confirma tu pago</strong> haciendo clic en el botón "He realizado el pago".</p>
                           <p>4. Nuestro equipo verificará la transacción y <strong>activará tu nuevo plan</strong> en un plazo máximo de 24 horas.</p>
                        </CardContent>
                    </Card>

                </div>

                <div className="md:col-span-2">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Instrucciones de Pago</CardTitle>
                             <CardDescription>Elige un método para continuar.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {/* Aquí iría la lógica para mostrar los métodos de pago configurados por el superadmin */}
                                <AccordionItem value="bancolombia_qr">
                                    <AccordionTrigger className="font-semibold flex items-center gap-2"><Banknote className="h-5 w-5" /> Bancolombia QR</AccordionTrigger>
                                    <AccordionContent className="text-center space-y-2">
                                        <p className="text-sm">Escanea el código QR desde la App Bancolombia para realizar el pago.</p>
                                        <Image src="https://placehold.co/200x200.png?text=QR+Bancolombia" alt="QR Bancolombia" width={150} height={150} className="mx-auto rounded-md border" />
                                        <p className="text-xs text-muted-foreground">Titular: Websapmax SAS <br/> NIT: 900.123.456-7</p>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="stripe">
                                    <AccordionTrigger className="font-semibold flex items-center gap-2"><CreditCard className="h-5 w-5"/> Tarjeta con Stripe</AccordionTrigger>
                                     <AccordionContent className="space-y-4">
                                        <p className="text-sm">Paga de forma segura con tu tarjeta de crédito o débito. La activación es automática.</p>
                                        <Button className="w-full" disabled>Pagar con Stripe (Próximamente)</Button>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg" onClick={handleConfirmPayment}>
                                He realizado el pago
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Usamos Suspense para poder usar useSearchParams en un componente cliente
export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutSkeleton />}>
            <CheckoutContent />
        </Suspense>
    );
}
