"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadCloud, PlayCircle, RotateCcw, Settings2, History, Trash2 } from "lucide-react"; // Removed UploadCloud as it's not used
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";

// Mock Data for Backup History - Using static dates to prevent hydration errors
const mockBackupHistory = [
  { id: "backup-001", date: "2024-07-31T02:00:00Z", statusKey: "superAdminBackup.status.completed", size: "1.2 GB", typeKey: "superAdminBackup.type.full" },
  { id: "backup-002", date: "2024-07-30T02:00:00Z", statusKey: "superAdminBackup.status.completed", size: "1.1 GB", typeKey: "superAdminBackup.type.full" },
  { id: "backup-003", date: "2024-07-29T02:00:00Z", statusKey: "superAdminBackup.status.failed", size: "N/A", typeKey: "superAdminBackup.type.incremental" },
  { id: "backup-004", date: "2024-07-25T02:00:00Z", statusKey: "superAdminBackup.status.completed", size: "980 MB", typeKey: "superAdminBackup.type.full" },
];

// Traducciones directas para tipos y estados de respaldo
const backupTypeTranslations = {
  "superAdminBackup.type.full": "Completo",
  "superAdminBackup.type.incremental": "Incremental"
};
const backupStatusTranslations = {
  "superAdminBackup.status.completed": "Completado",
  "superAdminBackup.status.failed": "Fallido"
};

export default function SuperAdminBackupPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<any | null>(null);
  const [openRestore, setOpenRestore] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openStartBackup, setOpenStartBackup] = useState(false);
  const [openRestoreOp, setOpenRestoreOp] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [backupHistory, setBackupHistory] = useState(mockBackupHistory);
  const [restoreSelectedId, setRestoreSelectedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  // Función para descargar respaldo mock
  const handleDownload = (backup: any) => {
    const blob = new Blob([`Backup: ${backup.id}`], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backup.id}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Respaldo iniciado',
      description: `El respaldo ${backup.id} se está descargando.`
    });
  };

  const handleOpenRestore = (backup: any) => { setSelectedBackup(backup); setOpenRestore(true); };
  const handleOpenDelete = (backup: any) => { setSelectedBackup(backup); setOpenDelete(true); };
  const handleCloseModals = () => { setOpenRestore(false); setOpenDelete(false); setSelectedBackup(null); };
  const handleRestore = () => {
    toast({
      title: 'Restauración iniciada',
      description: `El respaldo ${selectedBackup?.id} se está restaurando.`
    });
    handleCloseModals();
  };
  const handleDelete = () => {
    toast({
      title: 'Respaldo eliminado',
      description: `El respaldo ${selectedBackup?.id} ha sido eliminado.`
    });
    handleCloseModals();
  };

  // Iniciar respaldo
  const handleStartBackup = () => {
    setOpenStartBackup(true);
  };
  const confirmStartBackup = () => {
    // Simula la creación de un nuevo respaldo
    const newBackup = {
      id: `backup-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      statusKey: "superAdminBackup.status.completed",
      size: "1.0 GB",
      typeKey: "superAdminBackup.type.full"
    };
    setBackupHistory([newBackup, ...backupHistory]);
    toast({
      title: 'Respaldo iniciado',
      description: 'El respaldo se ha realizado correctamente.'
    });
    setOpenStartBackup(false);
  };
  // Restaurar desde operaciones
  const handleRestoreOp = () => {
    setOpenRestoreOp(true);
  };
  const confirmRestoreOp = () => {
    const backup = backupHistory.find(b => b.id === restoreSelectedId);
    toast({
      title: 'Restauración iniciada',
      description: `El respaldo ${backup?.id} se está restaurando.`
    });
    setOpenRestoreOp(false);
    setRestoreSelectedId(null);
  };
  // Configuración
  const handleSettings = () => {
    setOpenSettings(true);
  };
  const closeSettings = () => setOpenSettings(false);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Respaldo de superadmin</h1>
      <p className="text-lg text-muted-foreground">Descripción del componente</p>

      <Card>
        <CardHeader>
          <CardTitle>Operaciones</CardTitle>
          <CardDescription>Descripción de las operaciones</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button size="lg" className="w-full" onClick={handleStartBackup}>
            <PlayCircle className="mr-2 h-5 w-5" /> Iniciar Respaldo
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={handleRestoreOp}>
            <RotateCcw className="mr-2 h-5 w-5" /> Restaurar
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={handleSettings}>
            <Settings2 className="mr-2 h-5 w-5" /> Configuración
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Historial</CardTitle>
          <CardDescription>Descripción del historial</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Tamaño</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupHistory.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{format(new Date(backup.date), "MMM d, yyyy 'at' h:mm a")}</TableCell>
                  <TableCell>
                    <Badge variant={backup.typeKey === "superAdminBackup.type.full" ? "default" : "secondary"}>
                      {backupTypeTranslations[backup.typeKey] || backup.typeKey}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={backup.statusKey === "superAdminBackup.status.completed" ? "default" : "destructive"}
                           className={backup.statusKey === "superAdminBackup.status.completed" ? "bg-green-500 text-white" : ""}>
                      {backupStatusTranslations[backup.statusKey] || backup.statusKey}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{backup.size}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" title="Acciones">
                          <span className="sr-only">Acciones</span>
                          <History className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {backup.statusKey === "superAdminBackup.status.completed" && (
                          <DropdownMenuItem onSelect={() => handleDownload(backup)}>
                            Descargar respaldo
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => handleOpenRestore(backup)}>
                          Restaurar respaldo
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOpenDelete(backup)} className="text-destructive">
                          Eliminar respaldo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {backupHistory.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay historial
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Almacenamiento</CardTitle>
          <CardDescription>Descripción del almacenamiento</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">Ubicación: <span className="font-medium">/var/backups/websapmax (Servidor local)</span></p>
            <p className="text-sm text-muted-foreground">Capacidad: <span className="font-medium">500 GB</span></p>
            <p className="text-sm text-muted-foreground">Espacio utilizado: <span className="font-medium">150 GB (30%)</span></p>
            {/* Add a progress bar for storage usage */}
        </CardContent>
      </Card>

      {/* Modales de acciones */}
      <Dialog open={openRestore} onOpenChange={setOpenRestore}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restaurar respaldo</DialogTitle>
            <DialogDescription>¿Seguro que deseas restaurar este respaldo?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleRestore}>Restaurar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar respaldo</DialogTitle>
            <DialogDescription>¿Seguro que deseas eliminar este respaldo?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleDelete} variant="destructive">Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modales de acciones de Operaciones de Respaldo */}
      <Dialog open={openStartBackup} onOpenChange={setOpenStartBackup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Iniciar Respaldo</DialogTitle>
            <DialogDescription>¿Deseas iniciar un respaldo completo del sistema?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenStartBackup(false)}>Cancelar</Button>
            <Button onClick={confirmStartBackup}>Iniciar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openRestoreOp} onOpenChange={setOpenRestoreOp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restaurar</DialogTitle>
            <DialogDescription>Selecciona un respaldo para restaurar el sistema.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <select
              className="w-full border rounded p-2"
              value={restoreSelectedId || ''}
              onChange={e => setRestoreSelectedId(e.target.value)}
            >
              <option value="" disabled>Selecciona un respaldo...</option>
              {backupHistory.map(b => (
                <option key={b.id} value={b.id}>{`${b.id} - ${format(new Date(b.date), "MMM d, yyyy h:mm a")}`}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRestoreOp(false)}>Cancelar</Button>
            <Button onClick={confirmRestoreOp} disabled={!restoreSelectedId}>Restaurar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openSettings} onOpenChange={setOpenSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configuración</DialogTitle>
            <DialogDescription>Configuración de respaldos próximamente.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={closeSettings}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
