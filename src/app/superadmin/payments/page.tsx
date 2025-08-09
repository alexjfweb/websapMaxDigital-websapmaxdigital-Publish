
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, CreditCard, Search } from "lucide-react";
import { useCompanies } from "@/hooks/use-companies";
import { companyService } from "@/services/company-service";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/contexts/session-context";
import { Skeleton } from "@/components/ui/skeleton";
import type { Company } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

export default function SuperAdminPaymentsPage() {
  const { companies, isLoading, refreshCompanies } = useCompanies();
  const { currentUser } = useSession();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [actionToConfirm, setActionToConfirm] = useState<{ action: 'activate' | 'reject'; company: Company } | null>(null);

  const pendingPayments = useMemo(() => {
    let filtered = companies.filter(c => c.subscriptionStatus === 'pending_payment');
    if (searchTerm) {
        filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.ruc.includes(searchTerm) ||
            c.planId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return filtered;
  }, [companies, searchTerm]);

  const handleActivatePlan = async (company: Company) => {
    if (!currentUser || currentUser.role !== 'superadmin') {
      toast({ title: "Error de permisos", description: "No tienes autorización para realizar esta acción.", variant: "destructive" });
      return;
    }
    try {
      await companyService.updateCompany(company.id, { subscriptionStatus: 'active' }, currentUser);
      toast({ title: "Plan Activado", description: `La suscripción de ${company.name} ha sido activada.` });
      refreshCompanies();
    } catch (error: any) {
      toast({ title: "Error", description: `No se pudo activar el plan: ${error.message}`, variant: "destructive" });
    } finally {
      setActionToConfirm(null);
    }
  };

  const handleRejectPayment = (company: Company) => {
    // Lógica para rechazar el pago (ej. notificar al usuario, cambiar estado a 'rejected', etc.)
    toast({ title: "Acción no implementada", description: `La lógica para rechazar el pago de ${company.name} se implementará en el futuro.` });
    setActionToConfirm(null);
  };
  
  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
        </TableRow>
      ));
    }
    
    if (pendingPayments.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
            No hay pagos pendientes de verificación.
          </TableCell>
        </TableRow>
      );
    }

    return pendingPayments.map(company => (
      <TableRow key={company.id}>
        <TableCell>
          <div className="font-medium">{company.name}</div>
          <div className="text-xs text-muted-foreground">{company.ruc}</div>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{company.planId || 'No asignado'}</Badge>
        </TableCell>
        <TableCell>
          {company.updatedAt ? format(new Date(company.updatedAt), "dd/MM/yyyy HH:mm", { locale: es }) : 'N/A'}
        </TableCell>
        <TableCell className="text-right">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-green-600 hover:bg-green-100 hover:text-green-700"
            onClick={() => setActionToConfirm({ action: 'activate', company })}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Activar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:bg-red-100 hover:text-red-700"
            onClick={() => setActionToConfirm({ action: 'reject', company })}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rechazar
          </Button>
        </TableCell>
      </TableRow>
    ));
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Gestión de Pagos Pendientes
        </h1>
        <p className="text-lg text-muted-foreground">Verifica y aprueba las suscripciones pagadas por transferencia.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Pagos por Verificar</CardTitle>
            <CardDescription>Lista de empresas que han notificado un pago y esperan activación manual.</CardDescription>
             <div className="flex items-center gap-4 pt-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input 
                        placeholder="Buscar por nombre, RUC o plan..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={() => refreshCompanies()} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualizar
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Plan Solicitado</TableHead>
                <TableHead>Fecha de Solicitud</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableContent()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={!!actionToConfirm} onOpenChange={() => setActionToConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                Confirmar Acción
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionToConfirm?.action === 'activate'
                ? `¿Estás seguro de que quieres activar el plan para la empresa "${actionToConfirm?.company?.name}"? Esta acción no se puede deshacer.`
                : `¿Estás seguro de que quieres rechazar el pago para la empresa "${actionToConfirm?.company?.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (actionToConfirm?.action === 'activate') {
                  handleActivatePlan(actionToConfirm.company);
                } else if (actionToConfirm?.action === 'reject') {
                  handleRejectPayment(actionToConfirm.company);
                }
              }}
              className={actionToConfirm?.action === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              Sí, proceder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
