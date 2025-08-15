
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
      <h1 className="text-3xl font-bold text-primary">Mantenimiento del Sistema</h1>
      <p className="text-lg text-muted-foreground">Herramientas y tareas para asegurar el correcto funcionamiento de la plataforma.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Cache Management Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <HardDriveDownload className="h-8 w-8 text-primary" />
              <CardTitle>Gestión de Caché</CardTitle>
            </div>
            <CardDescription>Limpia la caché de la aplicación para reflejar cambios inmediatos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleAction('Limpiar caché')}>
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
              <CardTitle>Mantenimiento de BD</CardTitle>
            </div>
            <CardDescription>Ejecuta tareas como reindexar para optimizar el rendimiento.</CardDescription>
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
              <CardTitle>Diagnóstico del Sistema</CardTitle>
            </div>
            <CardDescription>Ejecuta pruebas para verificar la salud y estado del sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={() => handleAction('Ejecutar diagnóstico del sistema')}>
              <PlayCircle className="mr-2 h-5 w-5" />
              Ejecutar diagnóstico
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Mode Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-destructive" />
              <CardTitle>Modo de Mantenimiento</CardTitle>
            </div>
          <CardDescription>Activa una página de "en mantenimiento" para todos los usuarios no administradores.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Habilitar modo de mantenimiento
              </p>
              <p className="text-xs text-muted-foreground">
                Al activar, solo los superadministradores podrán acceder al sistema.
              </p>
            </div>
            <Switch id="maintenance-mode" aria-label="Label del switch de mantenimiento" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
