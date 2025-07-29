
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Settings, ShoppingBag, Utensils, Users, CreditCard, Share2, Palette,
  DollarSign, TrendingUp, CheckCircle, XCircle, Clock, Calendar, Briefcase, 
  ConciergeBell, AlertCircle
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/session-context";
import { useDishes } from "@/hooks/use-dishes";
import { useOrderContext } from "@/contexts/order-context";
import { useReservations } from "@/hooks/use-reservations";
import { useTables } from "@/hooks/use-tables";
import { useEmployees } from "@/hooks/use-employees";
import { isToday } from "date-fns";

export default function AdminDashboardPage() {
  const { currentUser } = useSession();
  const companyId = currentUser?.companyId;

  const { dishes, isLoading: isLoadingDishes } = useDishes(companyId);
  const { orders, loading: isLoadingOrders } = useOrderContext();
  const { reservations, isLoading: isLoadingReservations } = useReservations(companyId);
  const { tables, isLoading: isLoadingTables } = useTables(companyId);
  const { employees, isLoading: isLoadingEmployees } = useEmployees(companyId);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const stats = useMemo(() => {
    const todayOrders = orders.filter(o => isToday(new Date(o.date)));
    const completedToday = todayOrders.filter(o => o.status === 'completed');
    const salesToday = completedToday.reduce((sum, o) => sum + o.total, 0);
    const averageOrder = todayOrders.length > 0 ? salesToday / completedToday.length : 0;
    
    const outOfStockDishes = dishes.filter(d => d.stock === 0).length;
    const activeEmployees = employees.length;

    const todayReservations = reservations.filter(r => isToday(new Date(r.dateTime))).length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;

    return {
      totalDishesCount: dishes.length,
      pendingOrdersCount: orders.filter(order => order.status === 'pending').length,
      salesToday,
      averageOrder,
      completedOrdersToday: completedToday.length,
      cancelledOrders: todayOrders.filter(o => o.status === 'cancelled').length,
      outOfStockDishes,
      activeEmployees,
      todayReservations,
      occupiedTables,
      totalTables: tables.length,
    };
  }, [orders, dishes, employees, reservations, tables]);

  const StatCard = ({ title, value, icon, isLoading, subtext }: { title: string, value: string | number, icon: React.ReactNode, isLoading: boolean, subtext?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-24 mt-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  );

  if (!isClient) {
    // Skeleton for the entire page
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
            <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
            </div>
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Panel de administración</h1>
      <p className="text-lg text-muted-foreground">Descripción del panel de administración</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Ventas del día" value={`$${stats.salesToday.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} isLoading={isLoadingOrders} />
          <StatCard title="Pedidos completados hoy" value={stats.completedOrdersToday} icon={<CheckCircle className="h-5 w-5 text-muted-foreground" />} isLoading={isLoadingOrders} />
          <StatCard title="Reservas para hoy" value={stats.todayReservations} icon={<Calendar className="h-5 w-5 text-muted-foreground" />} isLoading={isLoadingReservations} />
          <StatCard title="Mesas ocupadas" value={`${stats.occupiedTables}/${stats.totalTables}`} icon={<ConciergeBell className="h-5 w-5 text-muted-foreground" />} isLoading={isLoadingTables} />
          <StatCard title="Pedidos pendientes" value={stats.pendingOrdersCount} icon={<ShoppingBag className="h-5 w-5 text-muted-foreground" />} isLoading={isLoadingOrders} />
          <StatCard title="Platos sin stock" value={stats.outOfStockDishes} icon={<AlertCircle className={`h-5 w-5 ${stats.outOfStockDishes > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />} isLoading={isLoadingDishes} />
          <StatCard title="Total Platos" value={stats.totalDishesCount} icon={<Utensils className="h-5 w-5 text-muted-foreground" />} isLoading={isLoadingDishes} />
          <StatCard title="Empleados activos" value={stats.activeEmployees} icon={<Users className="h-5 w-5 text-muted-foreground" />} isLoading={isLoadingEmployees} />
        </CardContent>
      </Card>

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

    </div>
  );
}
