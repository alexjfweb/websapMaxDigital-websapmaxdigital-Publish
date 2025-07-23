
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, BookUser, Megaphone, Bell } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeDashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Mock data for dashboard widgets
  const mockStats = {
    pendingOrders: 5,
    upcomingReservations: 3,
    newNotifications: 2,
  };
  
  if (!isClient) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Panel de empleado</h1>
      <p className="text-lg text-muted-foreground">Descripción del panel de empleado</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos pendientes</CardTitle>
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{mockStats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Descripción de los pedidos pendientes</p>
                <Link href="/employee/orders" className="text-sm text-primary hover:underline mt-2 block">Ver pedidos</Link>
            </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reservaciones próximas</CardTitle>
                <BookUser className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{mockStats.upcomingReservations}</div>
                <p className="text-xs text-muted-foreground">Descripción de las reservaciones próximas</p>
                <Link href="/employee/reservations" className="text-sm text-primary hover:underline mt-2 block">Ver reservaciones</Link>
            </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promover menú</CardTitle>
                <Megaphone className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Promover menú</div>
                <p className="text-xs text-muted-foreground">Descripción de la promoción</p>
                 <Link href="/employee/promote" className="text-sm text-primary hover:underline mt-2 block">Ver promoción</Link>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Notificaciones</CardTitle>
          <CardDescription>Descripción de las notificaciones</CardDescription>
        </CardHeader>
        <CardContent>
          {mockStats.newNotifications > 0 ? (
            <ul className="space-y-3">
              <li className="p-3 border rounded-md bg-accent/30">
                <p className="font-medium">Nuevo pedido</p>
                <p className="text-xs text-muted-foreground">2 minutos atrás</p>
              </li>
              <li className="p-3 border rounded-md">
                <p className="font-medium">Reservación confirmada</p>
                <p className="text-xs text-muted-foreground">1 hora atrás</p>
              </li>
            </ul>
          ) : (
            <p className="text-muted-foreground">No hay nuevas notificaciones</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
