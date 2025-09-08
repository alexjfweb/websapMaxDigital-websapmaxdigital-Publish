
import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { headers } from 'next/headers';
import { auditService } from '@/services/audit-service';
import type { Company } from '@/types';

// Helper para obtener las claves secretas de un documento de config central.
async function getPaymentKeys() {
  const db = getDb();
  const docRef = doc(db, "payment_methods", "main_payment_methods");
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("El documento de configuración de métodos de pago no existe.");
  }
  const config = docSnap.data();
  // Asumimos que las claves están en el plan premium como referencia, esto podría necesitar ajuste.
  return {
    stripeSecretKey: config.premium?.stripe?.secretKey,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET, // El webhook secret se mantiene en ENV por seguridad
    mpAccessToken: config.premium?.mercadoPago?.accessToken,
  };
}


// Handler para webhooks de Stripe
async function handleStripeWebhook(request: NextRequest, keys: any) {
  if (!keys.stripeSecretKey || !keys.stripeWebhookSecret) {
    console.error('Faltan claves de Stripe para procesar el webhook.');
    return new NextResponse('Configuración de servidor incompleta.', { status: 500 });
  }
  
  const stripe = new Stripe(keys.stripeSecretKey, { apiVersion: '2024-06-20' });
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      keys.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error(`❌ Error en la verificación del webhook de Stripe: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  const session = event.data.object as any;
  const db = getDb();

  // Manejar diferentes eventos de Stripe
  switch (event.type) {
    case 'checkout.session.completed': {
      if (session.mode === 'subscription') {
        const companyId = session.metadata.companyId;
        const planId = session.metadata.planId;
        const subscriptionId = session.subscription;

        await updateDoc(doc(db, 'companies', companyId), {
          subscriptionStatus: 'active',
          planId: planId,
          stripeSubscriptionId: subscriptionId,
          updatedAt: serverTimestamp(),
        });
        
        await auditService.log({
          entity: 'companies', entityId: companyId, action: 'updated',
          performedBy: { uid: 'stripe-webhook', email: 'webhook@stripe.com' },
          newData: { planId, subscriptionStatus: 'active', stripeSubscriptionId: subscriptionId },
          details: 'Suscripción activada por webhook de Stripe (checkout.session.completed).'
        });
        console.log(`✅ [Stripe Webhook] Suscripción activada para ${companyId}`);
      }
      break;
    }
    case 'invoice.paid': {
      const subscriptionId = session.subscription;
      // Lógica para confirmar que la suscripción sigue activa
      console.log(`✅ [Stripe Webhook] Factura pagada para suscripción ${subscriptionId}.`);
      break;
    }
    case 'invoice.payment_failed': {
       const subscriptionId = session.subscription;
       // Lógica para marcar la suscripción como 'past_due'
       console.log(`⚠️ [Stripe Webhook] Pago fallido para suscripción ${subscriptionId}.`);
       break;
    }
    case 'customer.subscription.deleted': {
        const subscriptionId = session.id;
        // Lógica para cancelar la suscripción en tu sistema
        console.log(`❌ [Stripe Webhook] Suscripción ${subscriptionId} cancelada.`);
        break;
    }
  }

  return NextResponse.json({ received: true });
}

// Handler para webhooks de Mercado Pago
async function handleMercadoPagoWebhook(request: NextRequest, keys: any) {
    if (!keys.mpAccessToken) {
        console.error('El Access Token de Mercado Pago no está configurado.');
        return new NextResponse('Configuración de servidor incompleta', { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const id = searchParams.get('id');

    if (topic === 'preapproval') {
        const client = new MercadoPagoConfig({ accessToken: keys.mpAccessToken });
        const preapproval = new PreApproval(client);
        const subscription = await preapproval.get({ id: id! });
        
        const externalReference = subscription.external_reference;
        if (!externalReference) return NextResponse.json({ received: true });
        
        const [companyId, planId] = externalReference!.split('|');

        let newStatus: Company['subscriptionStatus'] = 'pending_payment';
        if (subscription.status === 'authorized') {
            newStatus = 'active';
        } else if (subscription.status === 'cancelled' || subscription.status === 'paused') {
            newStatus = 'canceled';
        }

        const db = getDb();
        await updateDoc(doc(db, 'companies', companyId), {
            subscriptionStatus: newStatus,
            planId: planId,
            mpPreapprovalId: id,
            updatedAt: serverTimestamp(),
        });

        await auditService.log({
          entity: 'companies', entityId: companyId, action: 'updated',
          performedBy: { uid: 'mercadopago-webhook', email: 'webhook@mercadopago.com' },
          newData: { planId, subscriptionStatus: newStatus, mpPreapprovalId: id },
          details: `Suscripción actualizada por webhook de MP. Nuevo estado: ${newStatus}.`
        });
        console.log(`✅ [MP Webhook] Suscripción actualizada para ${companyId}. Estado: ${newStatus}`);
    }

    return NextResponse.json({ received: true });
}


export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
    const keys = await getPaymentKeys();

    if (pathname.includes('stripe')) {
      console.log("Recibiendo webhook de Stripe...");
      return await handleStripeWebhook(request, keys);
    } else if (pathname.includes('mercadopago')) {
      console.log("Recibiendo webhook de Mercado Pago...");
      return await handleMercadoPagoWebhook(request, keys);
    } else {
      console.warn("Webhook recibido en una ruta desconocida:", pathname);
      return new NextResponse('Webhook no reconocido', { status: 400 });
    }
  } catch (e: any) {
    console.error(`❌ Error procesando webhook en ${pathname}:`, e);
    return new NextResponse(`Error interno del servidor: ${e.message}`, { status: 500 });
  }
}
