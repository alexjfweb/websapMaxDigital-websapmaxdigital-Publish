
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
  // Asume localhost para desarrollo si no está en Vercel
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
}

// Handler para la creación de sesiones de checkout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, companyId, provider } = body;

    if (!planId || !companyId || !provider) {
      return NextResponse.json({ error: 'Faltan parámetros: planId, companyId y provider son requeridos.' }, { status: 400 });
    }

    // 1. Obtener los detalles del plan y la empresa
    const planSnap = await getDoc(doc(db, 'landingPlans', planId));
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Plan no encontrado.' }, { status: 404 });
    }
    const plan = planSnap.data() as LandingPlan;
    
    const companySnap = await getDoc(doc(db, 'companies', companyId));
    if (!companySnap.exists()) {
        return NextResponse.json({ error: 'Empresa no encontrada.' }, { status: 404 });
    }
    const company = companySnap.data() as Company;

    // 2. Obtener las credenciales de la pasarela de pago (almacenadas de forma segura en el superadmin)
    // ESTO ES UNA SIMULACIÓN. En producción, estas claves se obtendrían de una configuración segura.
    const paymentConfigSnap = await getDoc(doc(db, 'payment_methods', 'superadmin_config'));
    const paymentConfig = paymentConfigSnap.exists() ? paymentConfigSnap.data() : {};
    
    const baseUrl = getBaseUrl();

    let checkoutUrl = '';

    // 3. Generar la sesión de pago según el proveedor
    if (provider === 'stripe') {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY || paymentConfig.stripe?.secretKey;
      if (!stripeSecretKey) {
          throw new Error('La clave secreta de Stripe no está configurada.');
      }
      const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Plan ${plan.name} - ${company.name}`,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100), // Stripe espera el monto en centavos
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/admin/subscription?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/admin/checkout?plan=${plan.slug}&payment=cancelled`,
        metadata: {
          companyId,
          planId,
          userId: company.email, // Asociar con el email del admin de la empresa
        },
      });

      checkoutUrl = session.url!;

    } else if (provider === 'mercadopago') {
      const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || paymentConfig.mercadopago?.accessToken;
      if (!mpAccessToken) {
          throw new Error('El Access Token de Mercado Pago no está configurado.');
      }
      const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
      const preference = new Preference(client);

      const result = await preference.create({
        body: {
          items: [{
            id: plan.id,
            title: `Plan ${plan.name}`,
            quantity: 1,
            unit_price: plan.price,
            currency_id: 'COP', // Cambiar a la moneda correcta si es necesario
            description: plan.description,
          }],
          payer: {
            email: company.email,
            name: company.name,
          },
          back_urls: {
            success: `${baseUrl}/admin/subscription?payment=success`,
            failure: `${baseUrl}/admin/checkout?plan=${plan.slug}&payment=failure`,
            pending: `${baseUrl}/admin/checkout?plan=${plan.slug}&payment=pending`,
          },
          auto_return: 'approved',
          external_reference: `${companyId}|${planId}`, // Referencia para el webhook
        }
      });

      checkoutUrl = result.init_point!;
    
    } else {
      return NextResponse.json({ error: 'Proveedor de pago no soportado.' }, { status: 400 });
    }

    // 4. Devolver la URL de checkout al frontend
    return NextResponse.json({ url: checkoutUrl });

  } catch (e: any) {
    console.error('❌ Error creando la sesión de checkout:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
