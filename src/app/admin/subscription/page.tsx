
"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { useLandingPlans } from "@/hooks/use-landing-plans";
import { useEmployees } from "@/hooks/use-employees";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Star, ArrowRight, AlertCircle, XCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import SupportRequestDialog from '@/components/support/SupportRequestDialog';
import type { Company } from '@/types';


function SubscriptionSkeleton() {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-9 w-1/3 mb-2" />
                <Skeleton className="h-5 w-2/3" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-10 w-full mt-4" />
                    </CardContent>
                </Card>
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-8 w-1/4" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function PlanCard({ plan, isCurrent, isPopular }: { plan: any, isCurrent?: boolean, isPopular?: boolean }) {
    // CORRECCIÓN: Asegurarse de que el slug exista y sea válido
    const planSlug = plan.slug || plan.name.toLowerCase().replace(/\s+/g, '-');
    return (
        <Card className={`flex flex-col ${isCurrent ? 'border-primary border-2' : ''} ${isPopular ? 'border-yellow-400' : ''}`}>
             {isPopular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900">Popular</Badge>}
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="text-center">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/mes</span>
                </div>
                <ul className="space-y-2 text-sm">
                    {plan.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 mr-2 mt-1 text-green-500 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full" disabled={isCurrent}>
                    <Link href={`/admin/checkout?plan=${planSlug}`}>
                      {isCurrent ? 'Plan Actual' : 'Mejorar Plan'}
                    </Link>
                 </Button>
            </CardFooter>
        </Card>
    );
}


export default function SubscriptionPage() {
    const { subscription, isLoading: isLoadingSubscription, error: errorSubscription } = useSubscription();
    const { plans, isLoading: isLoadingPlans, error: errorPlans } = useLandingPlans();
    const { employees, isLoading: isLoadingEmployees } = useEmployees(subscription?.company?.id);
    const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);

    const isLoading = isLoadingSubscription || isLoadingPlans || isLoadingEmployees;
    const error = errorSubscription || errorPlans;

    const getStatusInfo = (status: Company['subscriptionStatus']) => {
        const statusMap: Record<string, { text: string; className: string }> = {
            trialing: { text: "En Prueba", className: "bg-blue-500" },
            active: { text: "Activo", className: "bg-green-500" },
            pending_payment: { text: "Pago Pendiente", className: "bg-yellow-500 text-yellow-900" },
            past_due: { text: "Vencido", className: "bg-red-500" },
            canceled: { text: "Cancelado", className: "bg-gray-500" },
            default: { text: status || "Desconocido", className: "bg-gray-500" }
        };
        return statusMap[status || 'default'] || statusMap.default;
    };


    if (isLoading) {
       return <SubscriptionSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center text-destructive py-12">
                <AlertCircle className="h-12 w-12 mb-4" />
                <h2 className="text-xl font-semibold">Error al Cargar la Suscripción</h2>
                <p>{error.message}</p>
            </div>
        )
    }

    const { company, plan } = subscription || {};
    const statusInfo = company ? getStatusInfo(company.subscriptionStatus) : null;
    
    // El plan gratuito no debe mostrarse como una opción de mejora
    const otherPlans = (plans || []).filter(p => p.id !== plan?.id && p.id !== 'plan-gratis-lite' && p.slug !== 'plan-gratuito');

    return (
        <>
            {company && (
                <SupportRequestDialog
                    isOpen={isSupportDialogOpen}
                    onClose={() => setIsSupportDialogOpen(false)}
                    companyId={company.id}
                    companyName={company.name}
                    planName={plan?.name || 'No Asignado'}
                />
            )}
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Gestiona tu Suscripción</h1>
                    <p className="text-lg text-muted-foreground">Consulta tu plan actual y explora otras opciones para crecer.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Tu Plan Actual</CardTitle>
                                <CardDescription>Este es el plan que tu empresa tiene actualmente.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {plan && company ? (
                                    <>
                                        <div className="text-center p-6 bg-muted rounded-lg">
                                            <h3 className="text-3xl font-bold text-primary">{plan.name}</h3>
                                            <p className="text-4xl font-extrabold mt-2">${plan.price}<span className="text-base font-normal text-muted-foreground">/mes</span></p>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Estado:</span>
                                                {statusInfo && (
                                                     <Badge variant="default" className={statusInfo.className}>
                                                        {statusInfo.text}
                                                    </Badge>
                                                )}
                                            </div>
                                             {company.trialEndsAt && new Date(company.trialEndsAt) > new Date() && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Prueba termina en:</span>
                                                    <span className="font-medium">{new Date(company.trialEndsAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Límite de empleados:</span>
                                                <span className="font-medium">{employees.length} / {plan.maxUsers === -1 ? 'Ilimitados' : plan.maxUsers}</span>
                                            </div>
                                        </div>
                                         {company.subscriptionStatus === 'pending_payment' && plan.slug && (
                                            <Button asChild className="w-full bg-primary hover:bg-primary/90">
                                                <Link href={`/admin/checkout?plan=${plan.slug}`}>
                                                    <CreditCard className="mr-2 h-4 w-4"/>
                                                    Realizar Pago
                                                </Link>
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">No tienes un plan o empresa asignada.</p>
                                )}
                                 <Button className="w-full" variant="outline" onClick={() => setIsSupportDialogOpen(true)}>
                                    Contactar a Soporte
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-6">Explora otros planes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {otherPlans.map(p => (
                                <PlanCard key={p.id} plan={p} isPopular={p.isPopular}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
