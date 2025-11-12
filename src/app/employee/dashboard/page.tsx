
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, BookUser, Megaphone, Bell, ClipboardList, Utensils, AlertCircle } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderContext } from "@/contexts/order-context";
import { useReservations } from "@/hooks/use-reservations";
import { useSession } from "@/contexts/session-context";
import { useTables } from "@/hooks/use-tables";

export default function EmployeeDashboardPage() {
  const { currentUser } = useSession();
  const { orders, loading: loadingOrders, error: errorOrders } = useOrderContext();
  const { reservations, isLoading: loadingReservations, error: errorReservations } = useReservations(currentUser?.companyId);
  const { tables, isLoading: loadingTables, isError: errorTables } = useTables(currentUser?.companyId);

  const isLoading = loadingOrders || loadingReservations || loadingTables;

  const pendingOrders = orders.filter(o => ['pending', 'preparing'].includes(o.status)).length;
  const upcomingReservations = reservations.filter(r => ['pending', 'confirmed'].includes(r.status)).length;
  const availableTables = tables.filter(t => t.status === 'available').length;
  const totalTables = tables.length;
  
  const mockNotifications = {
    newNotifications: 2,
  };
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (errorOrders || errorReservations || errorTables) {
    return (
        <div className="flex flex-col items-center justify-center text-center text-destructive py-12">
            <AlertCircle className="h-12 w-12 mb-4" />
            <h2 className="text-xl font-semibold">Error al Cargar el Panel</h2>
            <p>No se pudieron obtener algunos datos. Por favor, recarga la página.</p>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Panel de empleado</h1>
      <p className="text-lg text-muted-foreground">Accede a las herramientas diarias para la gestión del restaurante.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/employee/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos pendientes</CardTitle>
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingOrders}</div>
                    <p className="text-xs text-muted-foreground">Nuevos pedidos por atender.</p>
                </CardContent>
            </Card>
        </Link>

        <Link href="/employee/reservations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reservaciones próximas</CardTitle>
                    <BookUser className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{upcomingReservations}</div>
                    <p className="text-xs text-muted-foreground">Reservas por confirmar o atender.</p>
                </CardContent>
            </Card>
        </Link>
        
        <Link href="/employee/tables">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estado de Mesas</CardTitle>
                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{availableTables} <span className="text-lg text-muted-foreground">/ {totalTables}</span></div>
                    <p className="text-xs text-muted-foreground">Mesas disponibles actualmente.</p>
                </CardContent>
            </Card>
        </Link>

        <Link href="/employee/promote">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promover menú</CardTitle>
                    <Megaphone className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Compartir</div>
                    <p className="text-xs text-muted-foreground">Herramientas para compartir el menú.</p>
                </CardContent>
            </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Notificaciones Recientes</CardTitle>
          <CardDescription>Últimas actividades y alertas importantes.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockNotifications.newNotifications > 0 ? (
            <ul className="space-y-3">
              <li className="p-3 border rounded-md bg-accent/30">
                <p className="font-medium">Nuevo pedido recibido</p>
                <p className="text-xs text-muted-foreground">2 minutos atrás</p>
              </li>
              <li className="p-3 border rounded-md">
                <p className="font-medium">Reservación confirmada para las 8:00 PM</p>
                <p className="text-xs text-muted-foreground">1 hora atrás</p>
              </li>
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No hay nuevas notificaciones.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
