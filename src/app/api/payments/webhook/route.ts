
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { auditService } from '@/services/audit-service';
import type { Company } from '@/types';

// NOTE: The Stripe webhook functionality has been moved to /api/webhooks/stripe/route.ts
// This file is now ONLY for Mercado Pago.

async function getMercadoPagoAccessToken() {
  const db = getDb();
  const docRef = doc(db, "payment_methods", "main_payment_methods");
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("El documento de configuración de métodos de pago no existe.");
  }
  const config = docSnap.data();
  // Asumimos que las claves están en el plan premium como referencia, esto podría necesitar ajuste.
  return config.premium?.mercadoPago?.accessToken;
}

// Handler para webhooks de Mercado Pago
async function handleMercadoPagoWebhook(request: NextRequest) {
    const mpAccessToken = await getMercadoPagoAccessToken();
    if (!mpAccessToken) {
        console.error('El Access Token de Mercado Pago no está configurado.');
        return new NextResponse('Configuración de servidor incompleta', { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const id = searchParams.get('id');

    if (topic === 'preapproval') {
        const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
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
  // This endpoint is now dedicated to Mercado Pago.
  console.log("Recibiendo webhook de Mercado Pago...");
  try {
    return await handleMercadoPagoWebhook(request);
  } catch (e: any) {
    console.error(`❌ Error procesando webhook de Mercado Pago:`, e);
    return new NextResponse(`Error interno del servidor: ${e.message}`, { status: 500 });
  }
}
