
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UpgradePlanCardProps {
  featureName: string;
  description: string;
  requiredPlan: string;
}

export default function UpgradePlanCard({ featureName, description, requiredPlan }: UpgradePlanCardProps) {
  return (
    <Card className="max-w-2xl mx-auto mt-12 shadow-lg border-primary/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Lock className="w-12 h-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">
          Funcionalidad Bloqueada: {featureName}
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Mejora tu plan para acceder a esta y otras herramientas avanzadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">{description}</p>
        <p className="font-semibold">
          Esta función requiere un plan <span className="text-primary">{requiredPlan}</span>.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full text-lg py-6">
          <Link href="/admin/subscription">
            Ver Planes y Mejorar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
