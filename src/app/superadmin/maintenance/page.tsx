"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DatabaseZap, PlayCircle, HardDriveDownload, Wrench, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminMaintenancePage() {
  const { toast } = useToast();

  const handleAction = (actionName: string) => {
    toast({
      title: 'Acción activada',
      description: `La acción "${actionName}" ha sido activada correctamente.`,
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Mantenimiento</h1>
      <p className="text-lg text-muted-foreground">Descripción del mantenimiento</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Cache Management Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <HardDriveDownload className="h-8 w-8 text-primary" />
              <CardTitle>Título de la tarjeta de caché</CardTitle>
            </div>
            <CardDescription>Descripción de la tarjeta de caché</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleAction('Accionar la caché')}>
              <PlayCircle className="mr-2 h-5 w-5" />
              Limpiar caché
            </Button>
          </CardContent>
        </Card>

        {/* Database Maintenance Card */}
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <DatabaseZap className="h-8 w-8 text-primary" />
              <CardTitle>Título de la tarjeta de mantenimiento de la base de datos</CardTitle>
            </div>
            <CardDescription>Descripción de la tarjeta de mantenimiento de la base de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={() => handleAction('Reindexar la base de datos')}>
              <PlayCircle className="mr-2 h-5 w-5" />
              Reindexar base de datos
            </Button>
          </CardContent>
        </Card>

        {/* System Diagnostics Card */}
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-primary" />
              <CardTitle>Título de la tarjeta de diagnóstico del sistema</CardTitle>
            </div>
            <CardDescription>Descripción de la tarjeta de diagnóstico del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={() => handleAction('Ejecutar diagnóstico del sistema')}>
              <PlayCircle className="mr-2 h-5 w-5" />
              Ejecutar diagnóstico del sistema
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Mode Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-destructive" />
              <CardTitle>Título de la tarjeta de modo de mantenimiento</CardTitle>
            </div>
          <CardDescription>Descripción de la tarjeta de modo de mantenimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Habilitar modo de mantenimiento
              </p>
              <p className="text-xs text-muted-foreground">
                Descripción del modo de mantenimiento
              </p>
            </div>
            <Switch id="maintenance-mode" aria-label="Label del switch de mantenimiento" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
