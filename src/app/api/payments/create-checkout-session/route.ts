
import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { doc, getDoc } from 'firebase/firestore';
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

    // Correcto: Cargar la configuración de pago del perfil de la COMPAÑÍA que realiza el pago.
    // Esto es relevante si cada compañía puede tener sus propias credenciales, pero para un modelo SaaS,
    // usaremos una configuración central del Superadmin.
    const paymentMethodsConfig = company.paymentMethods;
    if (!paymentMethodsConfig) {
        console.error(`🔴 [Checkout API] - Error: La empresa ${companyId} no tiene métodos de pago configurados.`);
        throw new Error('La configuración de métodos de pago no está disponible para esta empresa.');
    }
    
    console.log('[Checkout API] - Configuración de pago encontrada.');

    const baseUrl = getBaseUrl();
    let checkoutUrl = '';

    // 3. Generar la sesión de pago según el proveedor
    if (provider === 'stripe') {
      const stripeConfig = paymentMethodsConfig.stripe;
      if (!stripeConfig?.enabled || !stripeConfig.secretKey) {
        console.error('🔴 [Checkout API] - Error: La clave secreta de Stripe no está configurada o el método está deshabilitado.');
        throw new Error('El método de pago Stripe no está configurado para esta empresa.');
      }
      const stripe = new Stripe(stripeConfig.secretKey, { apiVersion: '2024-06-20' });

      console.log('[Checkout API] - Creando sesión de Stripe...');
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Plan ${plan.name} - ${company.name}`,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/admin/subscription?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/admin/checkout?plan=${plan.slug}&payment=cancelled`,
        metadata: {
          companyId,
          planId,
          userId: company.email || 'N/A',
        },
      });

      checkoutUrl = session.url!;
      console.log('✅ [Checkout API] - Sesión de Stripe creada exitosamente.');

    } else if (provider === 'mercadopago') {
      const mpConfig = paymentMethodsConfig.mercadoPago;
      if (!mpConfig?.enabled || !mpConfig.accessToken) {
        console.error('🔴 [Checkout API] - Error: El Access Token de Mercado Pago no está configurado o el método está deshabilitado.');
        throw new Error('El método de pago Mercado Pago no está configurado para esta empresa.');
      }
      const client = new MercadoPagoConfig({ accessToken: mpConfig.accessToken });
      const preference = new Preference(client);

      console.log('[Checkout API] - Creando preferencia de Mercado Pago...');
      const result = await preference.create({
        body: {
          items: [{
            id: plan.id,
            title: `Plan ${plan.name}`,
            quantity: 1,
            unit_price: plan.price,
            currency_id: plan.currency || 'USD',
            description: plan.description,
          }],
          payer: {
            email: company.email || undefined,
            name: company.name,
          },
          back_urls: {
            success: `${baseUrl}/admin/subscription?payment=success`,
            failure: `${baseUrl}/admin/checkout?plan=${plan.slug}&payment=failure`,
            pending: `${baseUrl}/admin/checkout?plan=${plan.slug}&payment=pending`,
          },
          auto_return: 'approved',
          external_reference: `${companyId}|${planId}`,
        }
      });

      checkoutUrl = result.init_point!;
      console.log('✅ [Checkout API] - Preferencia de Mercado Pago creada exitosamente.');

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
