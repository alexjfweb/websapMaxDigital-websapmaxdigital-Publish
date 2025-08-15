
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, LineChart, PieChart, Bar, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Users, Store, ShoppingCart, DollarSign, Activity, TrendingUp, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

// Mock Data
const totalUsers = 150;
const totalCompanies = 5;
const totalOrders = 1250;
const totalRevenue = 75300.50;

const userGrowthData = [
  { month: "Jan", users: 12 },
  { month: "Feb", users: 25 },
  { month: "Mar", users: 45 },
  { month: "Apr", users: 60 },
  { month: "May", users: 78 },
  { month: "Jun", users: 95 },
  { month: "Jul", users: 150 },
];

const revenueData = [
  { month: "Jan", revenue: 5000 },
  { month: "Feb", revenue: 8500 },
  { month: "Mar", revenue: 12000 },
  { month: "Apr", revenue: 15000 },
  { month: "May", revenue: 21000 },
  { month: "Jun", revenue: 28000 },
  { month: "Jul", revenue: 35300.50 },
];

const roleDistributionData = [
    { name: "SuperAdmins", value: 2, fill: "hsl(var(--chart-1))" },
    { name: "Admins", value: 25, fill: "hsl(var(--chart-2))" },
    { name: "Employees", value: 123, fill: "hsl(var(--chart-3))" },
];

const recentActivityData = [
  { event: "New Company Registered", details: "The Burger Joint", timestamp: "2024-07-31T10:00:00Z" },
  { event: "New User Created", details: "chef.john (Employee)", timestamp: "2024-07-31T09:00:00Z" },
  { event: "System Backup Completed", details: "Full backup successful", timestamp: "2024-07-30T11:00:00Z" },
  { event: "High Revenue Day", details: "$2,500+", timestamp: "2024-07-29T11:00:00Z" },
];


export default function SuperAdminAnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Analítica de superadmin</h1>
        <p className="text-lg text-muted-foreground">Descripción de la página de análisis del superadmin</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de usuarios</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">+20.1% desde el último mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de empresas</CardTitle>
            <Store className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground">+1 este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de pedidos</CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+180 esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos totales</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% desde el último mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Título del gráfico de crecimiento de usuarios</CardTitle>
            <CardDescription>Descripción del gráfico de crecimiento de usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <RechartsBarChart data={userGrowthData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Título del gráfico de ingresos mensuales</CardTitle>
            <CardDescription>Descripción del gráfico de ingresos mensuales</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <LineChart data={revenueData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       {/* Role Distribution and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
             <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Título del gráfico de distribución de roles</CardTitle>
                    <CardDescription>Descripción del gráfico de distribución de roles</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-[250px] w-full">
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie data={roleDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                                {roleDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                             <Legend />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Título de actividad reciente</CardTitle>
                <CardDescription>Descripción de actividad reciente</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Evento</TableHead>
                        <TableHead>Detalles</TableHead>
                        <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {recentActivityData.map((activity, index) => (
                        <TableRow key={index}>
                        <TableCell className="font-medium">{activity.event}</TableCell>
                        <TableCell>{activity.details}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{format(new Date(activity.timestamp), "MMM d, h:mm a")}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
