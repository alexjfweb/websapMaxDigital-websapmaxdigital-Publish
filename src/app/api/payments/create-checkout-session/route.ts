
import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LandingPlan } from '@/services/landing-plans-service';
import type { Company } from '@/types';

// Helper para obtener la URL base de la aplicación
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
}

const CONFIG_DOC_ID = 'main_payment_methods';


// Handler para la creación de sesiones de checkout
export async function POST(request: NextRequest) {
  console.log('🔵 [Checkout API] - Solicitud de pago recibida.');
  try {
    const body = await request.json();
    const { planId, companyId, provider } = body;

    if (!planId || !companyId || !provider) {
      console.error('🔴 [Checkout API] - Error: Faltan parámetros. planId, companyId y provider son requeridos.');
      return NextResponse.json({ error: 'Faltan parámetros: planId, companyId y provider son requeridos.' }, { status: 400 });
    }

    console.log(`[Checkout API] - Procesando para companyId: ${companyId}, planId: ${planId}, provider: ${provider}`);

    // 1. Obtener detalles del plan y la empresa
    const planSnap = await getDoc(doc(db, 'landingPlans', planId));
    if (!planSnap.exists()) {
      console.error(`🔴 [Checkout API] - Error: Plan con ID ${planId} no encontrado.`);
      return NextResponse.json({ error: 'Plan no encontrado.' }, { status: 404 });
    }
    const plan = planSnap.data() as LandingPlan;

    const companySnap = await getDoc(doc(db, 'companies', companyId));
    if (!companySnap.exists()) {
      console.error(`🔴 [Checkout API] - Error: Empresa con ID ${companyId} no encontrada.`);
      return NextResponse.json({ error: 'Empresa no encontrada.' }, { status: 404 });
    }
    const company = companySnap.data() as Company;

    // Obtener la configuración de pago centralizada desde el documento del superadmin
    const paymentMethodsDoc = await getDoc(doc(db, "payment_methods", CONFIG_DOC_ID));
    if (!paymentMethodsDoc.exists()) {
        console.error(`🔴 [Checkout API] - Error: El documento de configuración de métodos de pago ('${CONFIG_DOC_ID}') no existe.`);
        throw new Error('La configuración de métodos de pago no está disponible.');
    }
    
    const allPlansConfig = paymentMethodsDoc.data();
    
    // Determinar el "nombre" del plan (ej. 'básico', 'estándar') basado en el slug o nombre del planId
    const planNameKey = plan.slug?.split('-')[1] as 'básico' | 'estándar' | 'premium' || 'básico';
    const paymentMethodsConfig = allPlansConfig[planNameKey];

    if (!paymentMethodsConfig) {
        console.error(`🔴 [Checkout API] - Error: No hay configuración de pago para el plan '${planNameKey}'.`);
        throw new Error(`La configuración de pago para el plan ${plan.name} no está disponible.`);
    }
    
    console.log(`[Checkout API] - Configuración de pago encontrada para el plan: ${planNameKey}`);

    const baseUrl = getBaseUrl();
    let checkoutUrl = '';

    // 3. Generar la sesión de pago según el proveedor
    if (provider === 'stripe') {
      const stripeConfig = paymentMethodsConfig.stripe;
      if (!stripeConfig?.enabled) {
        return NextResponse.json({ error: 'El método de pago Stripe no está habilitado para este plan.' }, { status: 400 });
      }
      if (!stripeConfig.secretKey) {
        console.error('🔴 [Checkout API] - Error: La clave secreta de Stripe no está configurada.');
        return NextResponse.json({ error: 'El método de pago Stripe no está configurado.' }, { status: 400 });
      }
      const stripe = new Stripe(stripeConfig.secretKey, { apiVersion: '2024-06-20' });

      // Busca o crea un cliente en Stripe
      let customerId = company.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: company.email,
          name: company.name,
          metadata: { companyId },
        });
        customerId = customer.id;
        // Actualiza el company document con el nuevo customerId
        await updateDoc(doc(db, 'companies', companyId), { stripeCustomerId: customerId });
      }

      console.log('[Checkout API] - Creando sesión de Stripe para suscripción...');
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Plan ${plan.name} - ${company.name}`,
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        customer: customerId,
        success_url: `${baseUrl}/admin/subscription?payment=success&provider=stripe`,
        cancel_url: `${baseUrl}/admin/checkout?plan=${plan.slug}&payment=cancelled`,
        metadata: {
          companyId,
          planId,
        },
      });

      checkoutUrl = session.url!;
      console.log('✅ [Checkout API] - Sesión de Stripe (suscripción) creada exitosamente.');

    } else if (provider === 'mercadopago') {
      const mpConfig = paymentMethodsConfig.mercadoPago;
      if (!mpConfig?.enabled) {
        return NextResponse.json({ error: 'El método de pago Mercado Pago no está habilitado para este plan.' }, { status: 400 });
      }
      if (!mpConfig.accessToken) {
        console.error('🔴 [Checkout API] - Error: El Access Token de Mercado Pago no está configurado.');
        return NextResponse.json({ error: 'El método de pago Mercado Pago no está configurado.' }, { status: 400 });
      }
      // VALIDACIÓN CLAVE: Verificar que el plan tenga el `preapproval_plan_id` de MP.
      if (!plan.mp_preapproval_plan_id) {
          console.error(`🔴 [Checkout API] - Error: El 'mp_preapproval_plan_id' de Mercado Pago no está configurado para el plan ${plan.name} en la base de datos.`);
          return NextResponse.json({ error: `Configuración de suscripción para este plan está incompleta.` }, { status: 500 });
      }

      const client = new MercadoPagoConfig({ accessToken: mpConfig.accessToken });
      const preapproval = new PreApproval(client);

      console.log('[Checkout API] - Creando Suscripción (Preapproval) de Mercado Pago...');
      const result = await preapproval.create({
        body: {
          preapproval_plan_id: plan.mp_preapproval_plan_id,
          payer_email: company.email,
          reason: `Suscripción al Plan ${plan.name} en WebSapMax`,
          back_url: `${baseUrl}/admin/subscription?payment=success&provider=mercadopago`,
          external_reference: `${companyId}|${planId}`,
        },
      });

      checkoutUrl = result.init_point!;
      console.log('✅ [Checkout API] - Suscripción de Mercado Pago creada exitosamente.');

    } else {
      console.error(`🔴 [Checkout API] - Error: Proveedor de pago no soportado: ${provider}.`);
      return NextResponse.json({ error: 'Proveedor de pago no soportado.' }, { status: 400 });
    }

    // 4. Devolver la URL de checkout al frontend
    console.log(`[Checkout API] - Devolviendo URL de checkout: ${checkoutUrl}`);
    return NextResponse.json({ url: checkoutUrl });

  } catch (e: any) {
    console.error('❌ [Checkout API] - Error fatal en el handler:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
