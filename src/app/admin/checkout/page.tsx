
"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLandingPlans } from '@/hooks/use-landing-plans';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, AlertCircle, ArrowLeft, Gem, CreditCard, Banknote, HelpCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { companyService } from '@/services/company-service';
import { useSession } from '@/contexts/session-context';
import MercadoPagoIcon from '@/components/icons/mercadopago-icon';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LandingPlan } from '@/services/landing-plans-service';
import SuccessModal from '@/components/ui/success-modal';

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

// Tipo para la configuración de métodos de pago disponibles
interface AvailablePayments {
  stripe: boolean;
  mercadopago: boolean;
  manual: boolean;
  qrUrl?: string;
}

const CONFIG_DOC_ID = 'main_payment_methods';

async function fetchAvailablePayments(plan: LandingPlan | undefined): Promise<AvailablePayments> {
    if (!plan || !plan.slug) return { stripe: false, mercadopago: false, manual: false };
    
    // Extrae el nombre clave del plan desde el slug, ej: 'plan-basico' -> 'básico'
    const planNameKey = plan.slug.includes('basico') ? 'básico'
                      : plan.slug.includes('estandar') ? 'estándar'
                      : plan.slug.includes('premium') ? 'premium'
                      : 'básico';

    try {
        const docRef = doc(db, "payment_methods", CONFIG_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const allConfig = docSnap.data();
            const planConfig = allConfig[planNameKey];
            return {
                stripe: planConfig?.stripe?.enabled ?? false,
                mercadopago: planConfig?.mercadoPago?.enabled ?? false,
                manual: planConfig?.bancolombiaQr?.enabled ?? false,
                qrUrl: planConfig?.bancolombiaQr?.qrImageUrl ?? "https://placehold.co/200x200.png?text=QR"
            };
        }
    } catch (error) {
        console.error("Error fetching payment methods config:", error);
    }

    return { stripe: false, mercadopago: false, manual: false };
}


function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planSlug = searchParams.get('plan');
    const paymentStatus = searchParams.get('payment');
    
    const { plans, isLoading, error } = useLandingPlans();
    const { toast } = useToast();
    const { currentUser } = useSession();
    const [isProcessingPayment, setIsProcessingPayment] = useState<null | 'stripe' | 'mercadopago'>(null);
    const [availablePayments, setAvailablePayments] = useState<AvailablePayments | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    const selectedPlan = plans.find(p => p.slug === planSlug);
    
    useEffect(() => {
        if (selectedPlan) {
            fetchAvailablePayments(selectedPlan).then(setAvailablePayments);
        }
    }, [selectedPlan]);
    
    useEffect(() => {
        // CORRECCIÓN: Solo mostrar el toast y limpiar la URL si los parámetros de pago están presentes.
        if (paymentStatus === 'cancelled' || paymentStatus === 'failure') {
            toast({
                title: 'Pago Cancelado o Fallido',
                description: 'El proceso de pago no se completó. Por favor, intenta de nuevo.',
                variant: 'destructive'
            });
            // Elimina solo los parámetros de pago, manteniendo el plan, para evitar el bucle.
            router.replace(`/admin/checkout?plan=${planSlug}`, { scroll: false });
        }
    }, [paymentStatus, router, planSlug, toast]);


    if (isLoading || availablePayments === null) {
        return <CheckoutSkeleton />;
    }

    if (error || !planSlug) {
        return (
            <div className="text-center py-10">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-lg font-medium">No se pudo cargar la página de pago</h2>
                <p className="mt-2 text-sm text-muted-foreground">{error?.message || 'El plan solicitado no es válido o hubo un problema de conexión.'}</p>
                 <Button asChild className="mt-6">
                    <Link href="/admin/subscription">Volver a Suscripciones</Link>
                </Button>
            </div>
        );
    }
    
    if (!selectedPlan) {
        return (
             <div className="text-center py-10">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-lg font-medium">Plan no encontrado</h2>
                <p className="mt-2 text-sm text-muted-foreground">El plan seleccionado ({planSlug}) no existe o no está disponible. Por favor, vuelve y elige otro plan.</p>
                <Button asChild className="mt-6">
                    <Link href="/admin/subscription">Volver a Suscripciones</Link>
                </Button>
            </div>
        );
    }
    
    const handleConfirmManualPayment = async () => {
        if (!currentUser || !currentUser.companyId) {
            toast({ title: "Error", description: "No se pudo identificar tu empresa.", variant: "destructive"});
            return;
        }
        
        try {
            await companyService.updateCompany(currentUser.companyId, {
                subscriptionStatus: 'pending_payment',
                planId: selectedPlan.id
            }, currentUser);
            
            setShowSuccessModal(true);
            
        } catch(e: any) {
             toast({ title: "Error", description: `No se pudo actualizar el estado de la suscripción: ${e.message}`, variant: "destructive"});
        }
    };
    
    const handleAutomaticPayment = async (provider: 'stripe' | 'mercadopago') => {
        if (!currentUser?.companyId) {
            toast({ title: "Error", description: "No se pudo identificar tu empresa.", variant: "destructive"});
            return;
        }
        if (!selectedPlan?.slug) {
            toast({ title: "Error", description: "No se pudo identificar el plan para el pago.", variant: "destructive"});
            return;
        }
        
        setIsProcessingPayment(provider);
        
        try {
            const response = await fetch('/api/payments/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: selectedPlan.slug,
                    companyId: currentUser.companyId,
                    provider: provider
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || `Error con ${provider}. Código: ${response.status}`;
                throw new Error(errorMsg);
            }

            router.push(data.url);

        } catch (err: any) {
            toast({
                title: 'Error de Pago',
                description: err.message || 'No se pudo iniciar el proceso de pago. Por favor, intente de nuevo.',
                variant: 'destructive',
            });
            setIsProcessingPayment(null);
        }
    };

    return (
        <>
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="¡Confirmación Enviada!"
                message="Hemos notificado al administrador. Tu plan será activado una vez se verifique el pago."
            />
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
                                        <p className="text-sm text-muted-foreground">/mes</p>
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
                               <p>1. <strong>Elige tu método de pago</strong>: automático (con tarjeta) o manual (con QR).</p>
                               <p>2. <strong>Pago automático:</strong> Serás redirigido a una pasarela segura. La activación de tu plan es instantánea.</p>
                               <p>3. <strong>Pago manual:</strong> Sigue las instrucciones, realiza el pago y haz clic en "He realizado el pago". Tu plan será activado en un plazo máximo de 24 horas tras la verificación.</p>
                            </CardContent>
                        </Card>

                    </div>

                    <div className="md:col-span-2">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Métodos de Pago</CardTitle>
                                 <CardDescription>Elige un método para continuar.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full" defaultValue="automatic">
                                    {availablePayments.stripe || availablePayments.mercadopago ? (
                                    <AccordionItem value="automatic">
                                        <AccordionTrigger className="font-semibold text-base">Pago Automático (Recomendado)</AccordionTrigger>
                                        <AccordionContent className="space-y-3 pt-3">
                                            {availablePayments.stripe && (
                                                <Button 
                                                    className="w-full"
                                                    onClick={() => handleAutomaticPayment('stripe')}
                                                    disabled={isProcessingPayment === 'stripe'}
                                                >
                                                     {isProcessingPayment === 'stripe' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CreditCard className="mr-2 h-4 w-4" />}
                                                     {isProcessingPayment === 'stripe' ? 'Procesando...' : 'Pagar con Tarjeta (Stripe)'}
                                                </Button>
                                            )}
                                            {availablePayments.mercadopago && (
                                                <Button 
                                                    className="w-full"
                                                    onClick={() => handleAutomaticPayment('mercadopago')}
                                                    disabled={isProcessingPayment === 'mercadopago'}
                                                >
                                                    {isProcessingPayment === 'mercadopago' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MercadoPagoIcon className="mr-2 h-4 w-4"/>}
                                                    {isProcessingPayment === 'mercadopago' ? 'Procesando...' : 'Pagar con Mercado Pago'}
                                                </Button>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No hay métodos de pago automáticos habilitados para este plan.</p>
                                    )}
                                     {availablePayments.manual && (
                                        <AccordionItem value="manual">
                                            <AccordionTrigger className="font-semibold text-base">Pago Manual (QR)</AccordionTrigger>
                                             <AccordionContent className="space-y-4 pt-3">
                                                <div className="text-center space-y-2">
                                                    <p className="text-sm">Escanea el código QR desde la App Bancolombia para realizar el pago.</p>
                                                    <Image src={availablePayments.qrUrl || ''} alt="QR Bancolombia" width={150} height={150} className="mx-auto rounded-md border" />
                                                    <p className="text-xs text-muted-foreground">Titular: Websapmax SAS <br/> NIT: 900.123.456-7</p>
                                                </div>
                                                 <Button className="w-full" size="lg" onClick={handleConfirmManualPayment}>
                                                    He realizado el pago
                                                </Button>
                                            </AccordionContent>
                                        </AccordionItem>
                                     )}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
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
