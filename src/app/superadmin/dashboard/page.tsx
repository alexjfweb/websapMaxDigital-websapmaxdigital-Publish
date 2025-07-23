"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, History, ShieldCheck, BarChart3, AlertTriangle, Activity } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from 'react';

export default function SuperAdminDashboardPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

  // Mock data for dashboard widgets
  const mockSaStats = {
    totalUsers: 150,
    totalAdmins: 25,
    totalEmployees: 100,
    systemHealthStatus: "Bueno", // Texto traducido directamente
    lastBackup: "2024-07-30 02:00 AM", // This would typically be dynamic
    criticalLogs: 3,
  };
  
  if (!isClient) {
    return null; // O un componente de carga
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Panel de superadministrador</h1>
      <p className="text-lg text-muted-foreground">Descripción del panel de superadministrador</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/superadmin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gestión de usuarios</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSaStats.totalUsers} usuarios</div>
              <p className="text-xs text-muted-foreground">
                {mockSaStats.totalAdmins} administradores, {mockSaStats.totalEmployees} empleados
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/backup">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Respaldo del sistema</CardTitle>
              <Server className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Respaldo del sistema</div>
              <p className="text-xs text-muted-foreground">Último respaldo: {mockSaStats.lastBackup}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/logs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros del sistema</CardTitle>
              <History className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Registros del sistema</div>
              <p className="text-xs text-muted-foreground text-red-500">{mockSaStats.criticalLogs} registros críticos</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Estado del sistema</CardTitle>
          <CardDescription>Descripción del estado del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <ShieldCheck className="h-10 w-10 text-green-500"/>
                <div>
                    <p className="text-sm font-medium leading-none">Estado de salud</p>
                    <p className="text-xl font-semibold">{mockSaStats.systemHealthStatus}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <BarChart3 className="h-10 w-10 text-blue-500"/>
                 <div>
                    <p className="text-sm font-medium leading-none">Usuarios activos</p>
                    <p className="text-xl font-semibold">42</p> {/* Mock data, could be dynamic */}
                </div>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4 col-span-full md:col-span-1">
                <AlertTriangle className="h-10 w-10 text-yellow-500"/>
                 <div>
                    <p className="text-sm font-medium leading-none">Alertas de seguridad</p>
                    <p className="text-xl font-semibold">0</p> {/* Mock data, could be dynamic */}
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
