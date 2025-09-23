
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getDb } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// NOTA: La funcionalidad de webhook de Mercado Pago ha sido movida a /api/webhooks/mercadopago
// Este archivo ahora está reservado para el webhook de Stripe.

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature') as string;

    if (!signature) {
      console.warn('[Stripe Webhook] No signature provided.');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    const db = getDb();
    const paymentDoc = await getDoc(doc(db, 'payment_methods', 'main_payment_methods'));
    
    if (!paymentDoc.exists()) {
        console.error('Webhook error: Missing payment_methods/main_payment_methods document in Firestore.');
        return NextResponse.json({ error: 'Stripe configuration is missing on the server.' }, { status: 500 });
    }
    const paymentData = paymentDoc.data();
    
    // Asumimos que las claves de producción están en 'premium', y las de sandbox en 'estándar'
    const stripeConfig = paymentData.premium?.stripe?.enabled 
      ? paymentData.premium.stripe 
      : paymentData.estándar?.stripe;

    const stripeWebhookSecret = stripeConfig?.webhookSecret; // Asumiendo que guardas el secret del webhook aquí

    if (!stripeConfig?.secretKey || !stripeWebhookSecret) {
      console.error('Webhook error: Missing Stripe secret key or webhook secret in Firestore.');
      return NextResponse.json({ error: 'Missing Stripe configuration' }, { status: 500 });
    }

    const stripe = new Stripe(stripeConfig.secretKey);
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { companyId, planId } = session.metadata || {};

      if (companyId && planId) {
        console.log(`[Stripe Webhook] Processing subscription for company: ${companyId}, plan: ${planId}`);
        await updateDoc(doc(db, 'companies', companyId), {
          subscriptionStatus: 'active',
          planId: planId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          updatedAt: new Date(),
        });
        console.log(`[Stripe Webhook] Subscription activated successfully for company: ${companyId}`);
      } else {
        console.error('[Stripe Webhook] Missing companyId or planId in session metadata');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error:', error.message);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
