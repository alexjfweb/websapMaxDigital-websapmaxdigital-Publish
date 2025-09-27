
// src/app/api/landing-plans/route.ts

import { NextResponse } from 'next/server';
import { landingPlansService } from '@/services/landing-plans-service';

// SOLUCIÓN: Desactiva el cacheo estático para esta ruta.
// Esto asegura que cada vez que se pida la lista de planes, se consulte
// la base de datos en tiempo real, evitando mostrar datos desactualizados.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Usamos el nuevo método para obtener solo los planes públicos
    const plans = await landingPlansService.getPublicPlans();
    return NextResponse.json(plans);
  } catch (error: any) {
    console.error('❌ [API /api/landing-plans] Error:', error.message);
    // Devolver un error claro que el frontend pueda interpretar
    return NextResponse.json(
      { error: 'Error al obtener los planes. Es posible que se requiera un índice en Firestore.' },
      { status: 500 }
    );
  }
}
