
import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { MercadoPagoConfig, Preference, PreApproval } from 'mercadopago';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { LandingPlan } from '@/services/landing-plans-service';
import type { Company } from '@/types';

// Helper para obtener la URL base de la aplicación de forma robusta
function getBaseUrl() {
  // Prioriza la variable de entorno si está definida para producción
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Fallback para el entorno de producción de Firebase si no hay variable de entorno.
  if (process.env.NODE_ENV === 'production') {
    return 'https://websap.site';
  }
  // Fallback para desarrollo local
  return 'http://localhost:9003';
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
    const db = getDb();
    // 1. Obtener detalles del plan y la empresa
    const plansCollection = collection(db, 'landingPlans');
    const q = query(plansCollection, where('slug', '==', planId), where('isActive', '==', true));
    const planQuerySnap = await getDocs(q);
    
    if (planQuerySnap.empty) {
        console.warn(`[Checkout API] - No se encontró el plan con slug '${planId}'.`);
        return NextResponse.json({ error: `Plan con slug '${planId}' no encontrado o inactivo.` }, { status: 404 });
    }
    const planSnap = planQuerySnap.docs[0];
    const plan = { id: planSnap.id, ...planSnap.data() } as LandingPlan;

    if (plan.price <= 0) {
      console.error(`🔴 [Checkout API] - Error: Intento de pago para un plan gratuito (precio: ${plan.price}).`);
      return NextResponse.json({ error: 'No se puede procesar un pago para un plan gratuito.' }, { status: 400 });
    }

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
    const planNameKey = (plan.slug?.replace(/^plan-/, '').replace(/-$/, '') || 'básico') as 'básico' | 'estándar' | 'premium' | 'emprendedor' | 'pro-plus-ilimitado' | 'uno';
    const paymentMethodsConfig = allPlansConfig[planNameKey] || allPlansConfig['estandar'] || allPlansConfig['estándar'];

    if (!paymentMethodsConfig) {
        console.error(`🔴 [Checkout API] - Error: No hay configuración de pago para el plan '${planNameKey}'.`);
        throw new Error(`La configuración de pago para el plan ${plan.name} no está disponible.`);
    }
    
    console.log(`[Checkout API] - Configuración de pago encontrada para el plan: ${planNameKey}`);

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
        success_url: `https://websap.site/admin/subscription?payment=success&session_id={CHECKOUT_SESSION_ID}&company_id=${companyId}&plan_id=${plan.slug}`,
        cancel_url: `https://websap.site/admin/checkout?plan=${plan.slug}&payment=cancelled`,
        metadata: {
          companyId: companyId,
          planId: plan.slug,
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
      
      const isProduction = mpConfig.accessToken.startsWith('APP_USR-');
      const client = new MercadoPagoConfig({ accessToken: mpConfig.accessToken });

      if (isProduction) {
          console.log(`[Checkout API] - Modo PRODUCCIÓN. Creando suscripción recurrente con PreApproval.`);
          if (!plan.mp_preapproval_plan_id) {
              console.error(`🔴 [Checkout API] - Error: El plan '${plan.name}' no tiene un 'mp_preapproval_plan_id' configurado para producción.`);
              return NextResponse.json({ error: `El plan ${plan.name} no está configurado para suscripciones recurrentes con Mercado Pago.` }, { status: 400 });
          }
          
          const preapproval = new PreApproval(client);
          
          const result = await preapproval.create({
              body: {
                preapproval_plan_id: plan.mp_preapproval_plan_id,
                reason: `Suscripción al Plan ${plan.name} de WebSapMax`,
                payer: {
                  email: company.email,
                },
                back_url: `https://websap.site/admin/subscription?payment=success&provider=mercadopago`,
                external_reference: `${companyId}|${plan.slug}`,
              }
          });
          
          checkoutUrl = result.init_point!;
          console.log('✅ [Checkout API] - URL de suscripción (PreApproval) de Mercado Pago creada exitosamente.');

      } else {
          console.log(`[Checkout API] - Modo SANDBOX. Creando pago único con Preference.`);
          const preference = new Preference(client);

          if (!companyId || !plan.slug || !plan.name || !plan.price) {
            throw new Error('Faltan datos críticos: companyId, plan.slug, plan.name o plan.price');
          }

          const result = await preference.create({
            body: {
              items: [
                {
                  id: `plan_${plan.slug}_${Date.now()}`,
                  title: `Plan ${plan.name} - WebSapMax`,
                  description: `Suscripción mensual al plan ${plan.name}`,
                  category_id: 'services',
                  quantity: 1,
                  currency_id: 'COP',
                  unit_price: plan.price,
                }
              ],
              payer: {
                email: company.email,
                name: company.name || 'Cliente',
                surname: 'WebSapMax',
              },
              back_urls: {
                success: 'https://websap.site/admin/subscription?payment=success',
                failure: 'https://websap.site/admin/subscription?payment=failure',
                pending: 'https://websap.site/admin/subscription?payment=pending'
              },
              auto_return: 'approved',
              external_reference: `ws_${companyId}_${plan.slug}_${Date.now()}`,
              notification_url: 'https://websap.site/api/webhooks/mercadopago',
              metadata: {
                company_id: companyId,
                plan_slug: plan.slug,
              }
            }
          });

          checkoutUrl = result.init_point!;
          console.log('✅ [Checkout API] - URL de preferencia de pago (Preference) creada para sandbox.');
      }
    } else {
      console.error(`🔴 [Checkout API] - Error: Proveedor de pago no soportado: ${provider}.`);
      return NextResponse.json({ error: 'Proveedor de pago no soportado.' }, { status: 400 });
    }

    console.log(`[Checkout API] - Devolviendo URL de checkout: ${checkoutUrl}`);
    return NextResponse.json({ url: checkoutUrl });

  } catch (e: any) {
    console.error('❌ [Checkout API] - Error fatal en el handler:', e);
    // Verificar si el error es de Mercado Pago
    const mpError = e.cause?.error || e.cause;
    if (mpError) {
        console.error('Detalle del error de Mercado Pago:', JSON.stringify(mpError, null, 2));
        const errorMessage = mpError.message || JSON.stringify(mpError);
        return NextResponse.json({ error: `Error de Mercado Pago: ${errorMessage}` }, { status: 400 });
    }
    
    return NextResponse.json({ error: e.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
