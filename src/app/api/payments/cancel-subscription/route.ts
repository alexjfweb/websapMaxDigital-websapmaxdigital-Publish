
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { auditService } from '@/services/audit-service';

async function getMercadoPagoAccessToken(planId: string): Promise<string> {
    const db = getDb();
    const docRef = doc(db, "payment_methods", "main_payment_methods");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error("El documento de configuración de métodos de pago no existe.");
    }
    
    const config = docSnap.data();
    const planKey = planId.includes('premium') || planId.includes('pro') ? 'premium' : 
                    planId.includes('estandar') || planId.includes('emprendedor') ? 'estándar' :
                    'básico';
    
    const accessToken = config[planKey]?.mercadoPago?.accessToken;

    if (!accessToken) {
        throw new Error(`El Access Token de Mercado Pago no está configurado para el nivel del plan: ${planKey}.`);
    }
    return accessToken;
}

export async function POST(request: NextRequest) {
    console.log('🚀 [Cancel API] - Solicitud de cancelación recibida.');

    try {
        const { companyId } = await request.json();

        if (!companyId) {
            return NextResponse.json({ error: 'El ID de la compañía es requerido.' }, { status: 400 });
        }

        const db = getDb();
        const companyRef = doc(db, 'companies', companyId);
        const companySnap = await getDoc(companyRef);

        if (!companySnap.exists()) {
            return NextResponse.json({ error: 'Compañía no encontrada.' }, { status: 404 });
        }

        const company = companySnap.data();
        const preapprovalId = company.mpPreapprovalId;
        const paymentId = company.mpPaymentId; // ← NUEVO: Obtener también el payment ID
        const planId = company.planId;

        // ✅ MODIFICADO: Aceptar si tiene preapprovalId O paymentId
        if ((!preapprovalId && !paymentId) || !planId) {
            return NextResponse.json({ 
                error: 'La compañía no tiene una suscripción activa para cancelar.' 
            }, { status: 400 });
        }

        // CASO 1: Suscripción Recurrente (tiene preapprovalId)
        if (preapprovalId) {
            console.log(`[Cancel API] - Cancelando suscripción recurrente ${preapprovalId} para la compañía ${companyId}`);

            const mpAccessToken = await getMercadoPagoAccessToken(planId);
            const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
            const preapproval = new PreApproval(client);

            // Cancelar la suscripción en Mercado Pago
            await preapproval.update({
                id: preapprovalId,
                body: {
                    status: 'cancelled',
                },
            });

            console.log(`✅ [Cancel API] - Suscripción recurrente ${preapprovalId} cancelada en Mercado Pago.`);
            
            await auditService.log({
                entity: 'companies',
                entityId: companyId,
                action: 'updated',
                performedBy: { uid: 'user-action', email: company.email },
                details: `El usuario canceló la suscripción recurrente de Mercado Pago (ID: ${preapprovalId}).`,
                newData: { subscriptionStatus: 'canceled' }
            });
        }
        // CASO 2: Pago Único (tiene paymentId)
        else if (paymentId) {
            console.log(`[Cancel API] - Cancelando suscripción de pago único ${paymentId} para la compañía ${companyId}`);
            console.log(`✅ [Cancel API] - Pago único ${paymentId} no requiere cancelación en Mercado Pago.`);
            
            await auditService.log({
                entity: 'companies',
                entityId: companyId,
                action: 'updated',
                performedBy: { uid: 'user-action', email: company.email },
                details: `El usuario canceló la suscripción de pago único (Payment ID: ${paymentId}).`,
                newData: { subscriptionStatus: 'canceled' }
            });
        }

        // Actualizar el estado en nuestra base de datos (común para ambos casos)
        await updateDoc(companyRef, {
            subscriptionStatus: 'canceled',
            updatedAt: serverTimestamp(),
        });

        console.log(`✅ [Cancel API] - Estado de la compañía ${companyId} actualizado a "canceled".`);

        return NextResponse.json({ 
            success: true, 
            message: 'Suscripción cancelada exitosamente.',
            paymentType: preapprovalId ? 'recurring' : 'one-time'
        });

    } catch (e: any) {
        console.error('❌ [Cancel API] - Error fatal en el handler:', e);
        const errorMessage = e.cause?.error?.message || e.message || 'Error interno del servidor.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
