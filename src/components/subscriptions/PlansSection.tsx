
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Plan {
  id?: string;
  name?: string;
  price?: number;
  features?: string[];
}

export default function PlansSection({ plans }: { plans: Plan[] }) {
  if (!plans || plans.length === 0) {
    return (
      <section className="py-12 bg-transparent">
        <h3 className="text-2xl font-bold text-center mb-8">Planes de Suscripción</h3>
        <div className="text-center text-muted-foreground">No hay planes disponibles.</div>
      </section>
    );
  }
  return (
    <section className="py-12 bg-transparent">
      <h3 className="text-2xl font-bold text-center mb-8">Planes de Suscripción</h3>
      <div className="flex flex-wrap justify-center gap-6">
        {plans.map((plan, idx) => (
          <div
            key={plan.id || idx}
            className="bg-white rounded-lg shadow-md p-6 w-80 flex flex-col items-center border-t-4 border-orange-500"
          >
            <div className="font-bold text-xl mb-2 text-orange-600">{plan.name || 'Sin nombre'}</div>
            <div className="text-2xl text-orange-600 font-bold mb-1">${plan.price ?? '--'} <span className="text-base font-normal">USD/mes</span></div>
            <ul className="text-sm text-gray-700 mb-3">
              {(plan.features || []).map((f, i) => <li key={i} className="flex items-center gap-2"><span className="text-green-600">✔</span>{f}</li>)}
            </ul>
            <Button className="mt-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow transition-colors">Ver detalles</Button>
          </div>
        ))}
      </div>
    </section>
  );
}
