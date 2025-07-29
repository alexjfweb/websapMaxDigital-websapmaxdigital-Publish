
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Settings, ShoppingBag, Utensils, Users, CreditCard, Share2, Palette,
  DollarSign, TrendingUp, CheckCircle, XCircle, Clock, Calendar, Briefcase, 
  ConciergeBell, AlertCircle, FileText, PackageCheck, PackageX, Truck
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/session-context";
import { useDishes } from "@/hooks/use-dishes";
import { useOrderContext, type Order } from "@/contexts/order-context";
import { useReservations } from "@/hooks/use-reservations";
import { useTables } from "@/hooks/use-tables";
import { useEmployees } from "@/hooks/use-employees";
import { isToday, subDays, format } from "date-fns";
import { motion } from "framer-motion";
import { BarChart as RechartsBarChart, LineChart, PieChart, AreaChart, Bar, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const StatCard = ({ title, value, icon, subtext, isLoading }: { title: string, value: string | number, icon: React.ReactNode, subtext?: string, isLoading: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
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
  </motion.div>
);

const OverviewChart = ({ orders }: { orders: Order[] }) => {
  const salesData = useMemo(() => {
    const data: { name: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, 'MMM d');
      const dailySales = orders
        .filter(o => o.status === 'completed' && format(new Date(o.date), 'MMM d') === formattedDate)
        .reduce((sum, o) => sum + o.total, 0);
      data.push({ name: formattedDate, total: dailySales });
    }
    return data;
  }, [orders]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={salesData}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <Tooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const OrdersByTypeChart = ({ orders }: { orders: Order[] }) => {
  const data = useMemo(() => {
    const typeCounts = orders.reduce((acc, order) => {
      acc[order.type] = (acc[order.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [orders]);
  
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))'];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Pie>
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const RecentActivity = ({ orders, reservations }: { orders: Order[], reservations: Reservation[] }) => {
  const combinedActivity = useMemo(() => {
    const orderActivity = orders.slice(0, 3).map(o => ({
      id: o.id,
      type: 'Pedido',
      description: `Pedido de ${o.customerName}`,
      value: `$${o.total.toFixed(2)}`,
      date: new Date(o.date)
    }));
    const reservationActivity = reservations.slice(0, 2).map(r => ({
      id: r.id,
      type: 'Reserva',
      description: `Reserva para ${r.numberOfGuests} de ${r.customerName}`,
      value: `Estado: ${r.status}`,
      date: new Date(r.dateTime)
    }));
    return [...orderActivity, ...reservationActivity].sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0,5);
  }, [orders, reservations]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="text-right">Valor/Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {combinedActivity.map(activity => (
          <TableRow key={`${activity.type}-${activity.id}`}>
            <TableCell>
              <Badge variant={activity.type === 'Pedido' ? 'default' : 'secondary'}>{activity.type}</Badge>
            </TableCell>
            <TableCell className="font-medium">{activity.description}</TableCell>
            <TableCell className="text-right">{activity.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


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
    const averageOrder = completedToday.length > 0 ? salesToday / completedToday.length : 0;
    
    const outOfStockDishes = dishes.filter(d => d.stock === 0).length;
    
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
      activeEmployees: employees.length,
      todayReservations,
      occupiedTables,
      totalTables: tables.length,
    };
  }, [orders, dishes, employees, reservations, tables]);


  if (!isClient) {
    return <Skeleton className="h-screen w-full" />;
  }

  const isLoading = isLoadingDishes || isLoadingOrders || isLoadingReservations || isLoadingTables || isLoadingEmployees;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Panel de administración</h1>
      <p className="text-lg text-muted-foreground">Una vista general y en tiempo real de tu restaurante.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ventas del día" value={`$${stats.salesToday.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-green-500" />} subtext="Ingresos de pedidos completados" isLoading={isLoading} />
        <StatCard title="Pedidos completados" value={stats.completedOrdersToday} icon={<PackageCheck className="h-5 w-5 text-blue-500" />} subtext="Pedidos finalizados hoy" isLoading={isLoading} />
        <StatCard title="Reservas para hoy" value={stats.todayReservations} icon={<Calendar className="h-5 w-5 text-purple-500" />} subtext="Total de reservas programadas" isLoading={isLoading} />
        <StatCard title="Platos sin stock" value={stats.outOfStockDishes} icon={<AlertCircle className={`h-5 w-5 ${stats.outOfStockDishes > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />} subtext="Items no disponibles en el menú" isLoading={isLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Visión General de Ventas</CardTitle>
                <CardDescription>Rendimiento de ventas de la última semana.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-[350px] w-full" /> : <OverviewChart orders={orders} />}
            </CardContent>
        </Card>
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Pedidos Recientes</CardTitle>
                <CardDescription>Últimos pedidos y reservas.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-[350px] w-full" /> : <RecentActivity orders={orders} reservations={reservations} />}
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>Desglose de Pedidos</CardTitle>
                <CardDescription>Distribución por tipo de pedido.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[250px] w-full" /> : <OrdersByTypeChart orders={orders} />}
            </CardContent>
        </Card>
        <Link href="/admin/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gestión de pedidos</CardTitle>
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Ver Pedidos</div>
                    <p className="text-xs text-muted-foreground">Administra todos los pedidos en tiempo real.</p>
                </CardContent>
            </Card>
        </Link>
        <Link href="/admin/dishes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gestión de platos</CardTitle>
                    <Utensils className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Editar Menú</div>
                    <p className="text-xs text-muted-foreground">Añade, edita y gestiona los platos de tu menú.</p>
                </CardContent>
            </Card>
        </Link>
      </div>

    </div>
  );
}
