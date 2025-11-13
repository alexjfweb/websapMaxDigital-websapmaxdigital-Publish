
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Settings, ShoppingBag, Utensils, Users, CreditCard, Share2, Palette, Printer, Download, LineChart as LineChartIcon, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, LineChart as RechartsLineChart, PieChart as RechartsPieChart, Bar, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import html2pdf from 'html2pdf.js';


// Mock Data for new detailed charts
const barChartData = [
  { category: 'Entradas', sales: 4000 },
  { category: 'Platos Fuertes', sales: 12000 },
  { category: 'Postres', sales: 8000 },
  { category: 'Bebidas', sales: 7000 },
  { category: 'Especiales', sales: 5500 },
];

const lineChartData = [
  { month: 'Ene', orders: 120 },
  { month: 'Feb', orders: 150 },
  { month: 'Mar', orders: 130 },
  { month: 'Abr', orders: 180 },
  { month: 'May', orders: 210 },
  { month: 'Jun', orders: 250 },
];

const pieChartData = [
  { name: 'En Local', value: 400, fill: "hsl(var(--chart-1))" },
  { name: 'Domicilio', value: 300, fill: "hsl(var(--chart-2))" },
  { name: 'Para Recoger', value: 200, fill: "hsl(var(--chart-3))" },
];

export default function AdminDashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const detailedStatsRef = useRef<HTMLDivElement>(null);
  const [activeChart, setActiveChart] = useState('bar');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = () => {
    const printContent = detailedStatsRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Estadísticas</title>');
        // Aquí podrías enlazar un CSS específico para impresión si lo tuvieras
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handleDownloadPdf = () => {
    const element = detailedStatsRef.current;
    if (element) {
      const today = new Date().toISOString().slice(0, 10);
      const opt = {
        margin: 0.5,
        filename: `Estadistica_${activeChart}_${today}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
      };
      html2pdf().from(element).set(opt).save();
    }
  };

  if (!isClient) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
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
                    <p className="text-2xl font-semibold">25</p> {/* Mock Data */}
                </div>
            </div>
             <div className="flex items-center space-x-4 rounded-md border p-4">
                <ShoppingBag className="h-8 w-8 text-primary"/>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Pedidos pendientes</p>
                    <p className="text-2xl font-semibold">5</p> {/* Mock Data */}
                </div>
            </div>
        </CardContent>
      </Card>
      
      {/* Detailed Statistics Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>Estadísticas Detalladas</CardTitle>
            <div className="flex items-center gap-2">
              <Tabs defaultValue="bar" onValueChange={setActiveChart} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="bar"><BarChart2 className="h-4 w-4 mr-2"/>Barras</TabsTrigger>
                  <TabsTrigger value="line"><LineChartIcon className="h-4 w-4 mr-2"/>Líneas</TabsTrigger>
                  <TabsTrigger value="pie"><PieChartIcon className="h-4 w-4 mr-2"/>Circular</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" onClick={handlePrint} className="bg-green-500 text-white hover:bg-green-600">
                <Printer className="mr-2 h-4 w-4" /> Imprimir
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf} className="bg-destructive text-white hover:bg-destructive/90">
                <Download className="mr-2 h-4 w-4" /> Descargar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent ref={detailedStatsRef}>
            <Tabs defaultValue="bar" value={activeChart} className="w-full">
                <TabsContent value="bar">
                    <ChartContainer config={{}} className="h-[350px] w-full">
                        <RechartsBarChart data={barChartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="category" tickLine={false} tickMargin={10} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={8} />
                        </RechartsBarChart>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="line">
                    <ChartContainer config={{}} className="h-[350px] w-full">
                        <RechartsLineChart data={lineChartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </RechartsLineChart>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="pie" className="flex justify-center">
                    <ChartContainer config={{}} className="h-[350px] w-full max-w-sm">
                        <RechartsPieChart>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </RechartsPieChart>
                    </ChartContainer>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
