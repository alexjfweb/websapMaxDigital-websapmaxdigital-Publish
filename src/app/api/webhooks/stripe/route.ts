
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getDb } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature') as string;

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    const db = getDb();
    // Obtener configuración de Stripe desde Firestore
    const paymentDoc = await getDoc(doc(db, 'payment_methods', 'main_payment_methods'));
    const paymentData = paymentDoc.data();

    if (!paymentData?.stripe?.secretKey || !paymentData?.stripe_webhook_secret) {
      console.error('Webhook error: Missing Stripe secret key or webhook secret in Firestore document payment_methods/main_payment_methods');
      return NextResponse.json({ error: 'Missing Stripe configuration' }, { status: 500 });
    }

    const stripe = new Stripe(paymentData.stripe.secretKey);
    let event: Stripe.Event;

    // Verificar la firma del webhook
    try {
      event = stripe.webhooks.constructEvent(body, signature, paymentData.stripe_webhook_secret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Procesar el evento
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { companyId, planId } = session.metadata || {};

      if (companyId && planId) {
        console.log(`Processing subscription for company: ${companyId}, plan: ${planId}`);

        // Actualizar la suscripción en Firestore
        await updateDoc(doc(db, 'companies', companyId), {
          subscriptionStatus: 'active',
          planId: planId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          updatedAt: new Date(),
        });

        console.log(`Subscription activated successfully for company: ${companyId}`);
      } else {
        console.error('Missing companyId or planId in session metadata');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
