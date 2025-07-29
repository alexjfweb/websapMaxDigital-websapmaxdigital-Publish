
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Settings, ShoppingBag, Utensils, Users, CreditCard, Share2, Palette } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/session-context";
import { useDishes } from "@/hooks/use-dishes";
import { useOrderContext } from "@/contexts/order-context";

export default function AdminDashboardPage() {
  const { currentUser } = useSession();
  const { dishes, isLoading: isLoadingDishes } = useDishes(currentUser?.companyId);
  const { orders, loading: isLoadingOrders } = useOrderContext();
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
  const totalDishesCount = dishes.length;

  if (!isClient) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Panel de administración</h1>
      <p className="text-lg text-muted-foreground">Descripción del panel de administración</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perfil</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Perfil del restaurante</div>
              <p className="text-xs text-muted-foreground">Secundario del perfil</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/dishes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platos</CardTitle>
              <Utensils className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestión de platos</div>
              <p className="text-xs text-muted-foreground">Secundario de platos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/employees">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empleados</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestión de empleados</div>
              <p className="text-xs text-muted-foreground">Secundario de empleados</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/reservations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservaciones</CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Reservas</div>
              <p className="text-xs text-muted-foreground">Secundario de reservaciones</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/payments">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos</CardTitle>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Métodos de pago</div>
              <p className="text-xs text-muted-foreground">Secundario de pagos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/share-menu">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compartir Menú</CardTitle>
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Compartir menú</div>
              <p className="text-xs text-muted-foreground">Secundario de compartir menú</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gestión de pedidos</CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ver y gestionar pedidos</div>
              <p className="text-xs text-muted-foreground">Administra todos los pedidos en tiempo real.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/dashboard/personalizacion">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personalización del Menú</CardTitle>
              <Palette className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Editar diseño visual</div>
              <p className="text-xs text-muted-foreground">Colores, tipografía y estilo del menú digital.</p>
            </CardContent>
          </Card>
        </Link>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Estadísticas rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <BarChart className="h-8 w-8 text-primary"/>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Platos totales</p>
                    {isLoadingDishes ? (
                      <Skeleton className="h-6 w-10 mt-1" />
                    ) : (
                      <p className="text-2xl font-semibold">{totalDishesCount}</p>
                    )}
                </div>
            </div>
             <div className="flex items-center space-x-4 rounded-md border p-4">
                <ShoppingBag className="h-8 w-8 text-primary"/>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Pedidos pendientes</p>
                    {isLoadingOrders ? (
                      <Skeleton className="h-6 w-10 mt-1" />
                    ) : (
                      <p className="text-2xl font-semibold">{pendingOrdersCount}</p>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
