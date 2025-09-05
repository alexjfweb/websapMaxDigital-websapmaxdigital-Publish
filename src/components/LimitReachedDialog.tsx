
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LimitReachedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'mesas' | 'reservas' | 'empleados';
  limit: number;
  planName: string;
}

export default function LimitReachedDialog({ isOpen, onClose, limitType, limit, planName }: LimitReachedDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="w-12 h-12 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Límite Alcanzado</DialogTitle>
          <DialogDescription className="text-md">
            Has alcanzado el límite de {limit} {limitType} permitido por tu plan actual: <strong>{planName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <p className="text-center text-muted-foreground mt-2">
          Para añadir más {limitType}, por favor, mejora tu plan de suscripción.
        </p>
        <DialogFooter className="mt-4 flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/admin/subscription">
              Ver Planes y Mejorar <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
