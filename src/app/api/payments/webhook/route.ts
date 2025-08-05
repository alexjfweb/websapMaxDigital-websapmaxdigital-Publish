
import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { MercadoPagoConfig, MerchantOrder } from 'mercadopago';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { headers } from 'next/headers';
import { companyService } from '@/services/company-service';
import { auditService } from '@/services/audit-service';

// Handler para webhooks de Stripe
async function handleStripeWebhook(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Error en la verificación del webhook de Stripe: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Manejar el evento checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { companyId, planId, userId } = session.metadata!;

    console.log(`✅ Webhook de Stripe recibido: Pago exitoso para companyId: ${companyId}, planId: ${planId}`);

    // Aquí actualizamos el estado de la suscripción de la empresa en Firestore
    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, {
      planId: planId,
      subscriptionStatus: 'active',
      updatedAt: serverTimestamp(),
    });
    
    await auditService.log({
        entity: 'companies',
        entityId: companyId,
        action: 'updated',
        performedBy: { uid: 'stripe-webhook', email: 'webhook@stripe.com' },
        newData: { planId, subscriptionStatus: 'active' },
        details: 'Plan actualizado automáticamente por pago exitoso en Stripe.'
    });
  }

  return NextResponse.json({ received: true });
}

// Handler para webhooks de Mercado Pago
async function handleMercadoPagoWebhook(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const id = searchParams.get('id');

    if (topic === 'merchant_order') {
        const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!mpAccessToken) {
            console.error('El Access Token de Mercado Pago no está configurado.');
            return new NextResponse('Configuración de servidor incompleta', { status: 500 });
        }
        
        const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
        const merchantOrder = new MerchantOrder(client);

        const order = await merchantOrder.get({ merchantOrderId: id! });
        
        if (order.status === 'closed' && order.order_status === 'paid') {
            const externalReference = order.external_reference;
            const [companyId, planId] = externalReference!.split('|');
            
            console.log(`✅ Webhook de Mercado Pago recibido: Pago exitoso para companyId: ${companyId}, planId: ${planId}`);
            
            const companyRef = doc(db, 'companies', companyId);
            await updateDoc(companyRef, {
                planId: planId,
                subscriptionStatus: 'active',
                updatedAt: serverTimestamp(),
            });

            await auditService.log({
                entity: 'companies',
                entityId: companyId,
                action: 'updated',
                performedBy: { uid: 'mercadopago-webhook', email: 'webhook@mercadopago.com' },
                newData: { planId, subscriptionStatus: 'active' },
                details: 'Plan actualizado automáticamente por pago exitoso en Mercado Pago.'
            });
        }
    }

    return NextResponse.json({ received: true });
}


export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
    if (pathname.includes('stripe')) {
      console.log("Recibiendo webhook de Stripe...");
      return await handleStripeWebhook(request);
    } else if (pathname.includes('mercadopago')) {
      console.log("Recibiendo webhook de Mercado Pago...");
      return await handleMercadoPagoWebhook(request);
    } else {
      console.warn("Webhook recibido en una ruta desconocida:", pathname);
      return new NextResponse('Webhook no reconocido', { status: 400 });
    }
  } catch (e: any) {
    console.error(`❌ Error procesando webhook en ${pathname}:`, e);
    return new NextResponse(`Error interno del servidor: ${e.message}`, { status: 500 });
  }
}
