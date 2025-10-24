import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { auditService } from '@/services/audit-service';
import type { Company } from '@/types';

// Helper para obtener el Access Token de forma centralizada
async function getMercadoPagoAccessToken() {
  const db = getDb();
  // Asumimos que las claves de producción están en el plan premium
  // y las de sandbox en el estándar, como en la configuración del checkout.
  const docRef = doc(db, "payment_methods", "main_payment_methods");
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error("El documento de configuración de métodos de pago ('main_payment_methods') no existe.");
  }
  
  const config = docSnap.data();
  // Intentar obtener el de producción primero, luego el de sandbox como fallback.
  const accessToken = config.premium?.mercadoPago?.accessToken || config.estándar?.mercadoPago?.accessToken;

  if (!accessToken) {
    throw new Error("El Access Token de Mercado Pago no está configurado en Firestore.");
  }
  return accessToken;
}

// Handler principal para todos los webhooks de Mercado Pago
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, data, type } = body;

  console.log(`[MP Webhook] Notificación recibida. Tipo: ${type}, Acción: ${action}`);

  if (!data?.id) {
    console.warn('[MP Webhook] Notificación recibida sin ID de datos.');
    return NextResponse.json({ received: true, message: 'No data ID' });
  }

  try {
    const mpAccessToken = await getMercadoPagoAccessToken();
    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });

    if (type === 'payment') {
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: data.id });
        
        const externalReference = paymentInfo.external_reference;
        if (!externalReference) {
            console.warn(`[MP Webhook] Pago ${data.id} sin external_reference.`);
            return NextResponse.json({ received: true, message: 'Missing external_reference' });
        }

        const [prefix, companyId, planSlug] = externalReference.split('_');

        if (prefix !== 'ws' || !companyId || !planSlug) {
             console.warn(`[MP Webhook] external_reference con formato inválido: ${externalReference}`);
             return NextResponse.json({ received: true, message: 'Invalid external_reference format' });
        }

        let newStatus: Company['subscriptionStatus'] = 'pending_payment';
        if (paymentInfo.status === 'approved') {
            newStatus = 'active';
        } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
            newStatus = 'canceled';
        }

        const db = getDb();
        await updateDoc(doc(db, 'companies', companyId), {
            subscriptionStatus: newStatus,
            planId: planSlug,
            mpPaymentId: data.id, // Guardar el ID del pago
            updatedAt: serverTimestamp(),
        });
        
        await auditService.log({
          entity: 'companies', entityId: companyId, action: 'updated',
          performedBy: { uid: 'mercadopago-webhook', email: 'webhook@mercadopago.com' },
          newData: { planId: planSlug, subscriptionStatus: newStatus, mpPaymentId: data.id },
          details: `Suscripción (vía Preference) actualizada por webhook. Nuevo estado: ${newStatus}.`
        });
        console.log(`✅ [MP Webhook] Compañía ${companyId} actualizada a plan ${planSlug}, estado ${newStatus}.`);

    } else if (type === 'preapproval') {
        // Lógica para suscripciones recurrentes de producción
        const preapproval = new PreApproval(client);
        const subscription = await preapproval.get({ id: data.id });
        
        const externalReference = subscription.external_reference;
        if (!externalReference) {
            console.warn(`[MP Webhook] PreApproval ${data.id} sin external_reference.`);
            return NextResponse.json({ received: true, message: 'Missing external_reference' });
        }
        
        const [companyId, planId] = externalReference.split('|');

        if (!companyId || !planId) {
            console.warn(`[MP Webhook] external_reference con formato inválido para PreApproval: ${externalReference}`);
            return NextResponse.json({ received: true, message: 'Invalid external_reference format for PreApproval' });
        }

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
            mpPreapprovalId: data.id,
            updatedAt: serverTimestamp(),
        });

        await auditService.log({
          entity: 'companies', entityId: companyId, action: 'updated',
          performedBy: { uid: 'mercadopago-webhook', email: 'webhook@mercadopago.com' },
          newData: { planId, subscriptionStatus: newStatus, mpPreapprovalId: data.id },
          details: `Suscripción (vía PreApproval) actualizada por webhook. Nuevo estado: ${newStatus}.`
        });
        console.log(`✅ [MP Webhook] Suscripción recurrente actualizada para ${companyId}. Estado: ${newStatus}`);
    }

    return NextResponse.json({ received: true });

  } catch (e: any) {
    console.error(`❌ Error procesando webhook de Mercado Pago:`, e);
    return new NextResponse(`Error interno del servidor: ${e.message}`, { status: 500 });
  }
}
