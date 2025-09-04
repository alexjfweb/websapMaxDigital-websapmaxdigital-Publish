
import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LandingPlan } from '@/services/landing-plans-service';
import type { Company } from '@/types';

// Helper para obtener la URL base de la aplicación
function getBaseUrl() {
  // Prioriza la variable de entorno de Vercel si existe
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  // Fallback para entornos locales o de desarrollo
  const localUrl = 'http://localhost:9003';
  return process.env.NEXT_PUBLIC_BASE_URL || localUrl;
}

const CONFIG_DOC_ID = 'main_payment_methods';


// Handler para la creación de sesiones de checkout
export async function POST(request: NextRequest) {
  console.log('🚀 API ROUTE HIT - POST /api/payments/create-checkout-session');
  
  try {
    const body = await request.json();
    const { planId, companyId, provider } = body;

    if (!planId || !companyId || !provider) {
      console.error('🔴 [Checkout API] - Error: Faltan parámetros. planId, companyId y provider son requeridos.');
      return NextResponse.json({ error: 'Faltan parámetros: planId, companyId y provider son requeridos.' }, { status: 400 });
    }

    console.log(`[Checkout API] - Procesando para companyId: ${companyId}, planSlug: ${planId}, provider: ${provider}`);

    // 1. Obtener detalles del plan y la empresa
    const plansCollection = collection(db, 'landingPlans');
    const q = query(plansCollection, where('slug', '==', planId), where('isActive', '==', true));
    const planQuerySnap = await getDocs(q);
    
    let planSnap = planQuerySnap.docs[0];

    if (!planSnap) {
        console.warn(`[Checkout API] - No se encontró el plan con slug '${planId}'.`);
        return NextResponse.json({ error: `Plan con slug '${planId}' no encontrado o inactivo.` }, { status: 404 });
    }
    const plan = { id: planSnap.id, ...planSnap.data() } as LandingPlan;

    const companySnap = await getDoc(doc(db, 'companies', companyId));
    if (!companySnap.exists()) {
      console.error(`🔴 [Checkout API] - Error: Empresa con ID ${companyId} no encontrada.`);
      return NextResponse.json({ error: 'Empresa no encontrada.' }, { status: 404 });
    }
    const company = companySnap.data() as Company;

    const paymentMethodsDoc = await getDoc(doc(db, "payment_methods", CONFIG_DOC_ID));
    if (!paymentMethodsDoc.exists()) {
        console.error(`🔴 [Checkout API] - Error: El documento de configuración de métodos de pago ('${CONFIG_DOC_ID}') no existe. Por favor, configúrelo desde el panel de superadministrador.`);
        throw new Error('La configuración de métodos de pago no está disponible. Contacte al administrador.');
    }
    
    const allPlansConfig = paymentMethodsDoc.data();
    const planNameKey = plan.slug?.split('-')[1] as 'básico' | 'estándar' | 'premium' || 'básico';
    const paymentMethodsConfig = allPlansConfig[planNameKey];

    if (!paymentMethodsConfig) {
        console.error(`🔴 [Checkout API] - Error: No hay configuración de pago para el plan '${planNameKey}'.`);
        throw new Error(`La configuración de pago para el plan ${plan.name} no está disponible.`);
    }
    
    console.log(`[Checkout API] - Configuración de pago encontrada para el plan: ${planNameKey}`);

    const baseUrl = getBaseUrl();
    let checkoutUrl = '';

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

      let customerId = company.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: company.email,
          name: company.name,
          metadata: { companyId },
        });
        customerId = customer.id;
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
        success_url: `${baseUrl}/admin/subscription?payment=success&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/admin/checkout?plan=${plan.slug}&payment=cancelled`,
        metadata: {
          companyId,
          planId: plan.slug, // CORREGIDO: Usar el slug como identificador consistente
          planSlug: plan.slug,
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

      const client = new MercadoPagoConfig({ accessToken: mpConfig.accessToken });
      const preapproval = new PreApproval(client);

      if (!plan.mp_preapproval_plan_id) {
          console.error(`🔴 [Checkout API] - Error: El plan ${plan.name} (${plan.id}) no tiene un 'mp_preapproval_plan_id' configurado.`);
          return NextResponse.json({ error: `Configuración de suscripción para este plan está incompleta.` }, { status: 500 });
      }
      
      console.log(`[Checkout API] - Creando suscripción de Mercado Pago con preapproval_plan_id: ${plan.mp_preapproval_plan_id}`);
      
      const result = await preapproval.create({
          body: {
            preapproval_plan_id: plan.mp_preapproval_plan_id,
            payer_email: company.email,
            back_url: `${baseUrl}/admin/subscription?payment=success&provider=mercadopago`,
            reason: `Suscripción al Plan ${plan.name} de WebSapMax`,
            external_reference: `${companyId}|${plan.slug}`, // CORREGIDO: Enviar el slug
          }
      });
      
      checkoutUrl = result.init_point!;
      console.log('✅ [Checkout API] - URL de suscripción de Mercado Pago creada exitosamente.');

    } else {
      console.error(`🔴 [Checkout API] - Error: Proveedor de pago no soportado: ${provider}.`);
      return NextResponse.json({ error: 'Proveedor de pago no soportado.' }, { status: 400 });
    }

    console.log(`[Checkout API] - Devolviendo URL de checkout: ${checkoutUrl}`);
    return NextResponse.json({ url: checkoutUrl });

  } catch (e: any) {
    console.error('❌ [Checkout API] - Error fatal en el handler:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
