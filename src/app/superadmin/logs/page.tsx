"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Eye } from "lucide-react";
import React, { useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Definición de las traducciones directamente en el archivo
const logTranslations = {
  "superAdminLogs.level.info": "Info",
  "superAdminLogs.level.warn": "Advertencia",
  "superAdminLogs.level.error": "Error",
  "superAdminLogs.level.debug": "Depuración",
  "superAdminLogs.level.critical": "Crítico",
};

// Mock Data
const mockLogs = [
  { id: "log-001", level: "superAdminLogs.level.info", message: "User 'admin@example.com' logged in.", timestamp: "2024-07-31T10:00:00Z" },
  { id: "log-002", level: "superAdminLogs.level.warn", message: "Database connection is slow.", timestamp: "2024-07-31T09:30:00Z" },
  { id: "log-003", level: "superAdminLogs.level.error", message: "Failed to process payment for invoice #12345.", timestamp: "2024-07-31T09:15:00Z" },
  { id: "log-004", level: "superAdminLogs.level.critical", message: "System backup failed.", timestamp: "2024-07-31T02:00:00Z" },
];

export default function SuperAdminLogsPage() {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const getLevelBadge = (levelKey: keyof typeof logTranslations) => {
    const levelText = logTranslations[levelKey] || levelKey;
    switch (levelKey) {
      case "superAdminLogs.level.info": return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{levelText}</Badge>;
      case "superAdminLogs.level.warn": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{levelText}</Badge>;
      case "superAdminLogs.level.error": return <Badge variant="destructive">{levelText}</Badge>;
      case "superAdminLogs.level.critical": return <Badge variant="destructive" className="bg-red-800 text-white">{levelText}</Badge>;
      default: return <Badge variant="outline">{levelText}</Badge>;
    }
  };

  const filteredLogs = mockLogs.filter(log => levelFilter === "all" || log.level === levelFilter);
  const handleOpenDetail = (log: any) => { setSelectedLog(log); setOpenDetail(true); };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Registros del sistema</h1>
      <p className="text-lg text-muted-foreground">Descripción de la página</p>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Todos los registros</CardTitle>
              <CardDescription>Descripción de la sección</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><Filter className="mr-2 h-4 w-4"/>Filtrar por nivel</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setLevelFilter("all")}>Todos</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLevelFilter("superAdminLogs.level.info")}>Info</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLevelFilter("superAdminLogs.level.warn")}>Advertencia</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLevelFilter("superAdminLogs.level.error")}>Error</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLevelFilter("superAdminLogs.level.critical")}>Crítico</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nivel</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getLevelBadge(log.level as keyof typeof logTranslations)}</TableCell>
                  <TableCell className="font-medium">{log.message}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Ver detalles" onClick={() => handleOpenDetail(log)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ver detalles</DialogTitle>
            <DialogDescription>{selectedLog?.message}</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="text-sm space-y-2">
              <div><b>ID:</b> {selectedLog.id}</div>
              <div><b>Nivel:</b> {logTranslations[selectedLog.level as keyof typeof logTranslations] || selectedLog.level}</div>
              <div><b>Timestamp:</b> {new Date(selectedLog.timestamp).toLocaleString()}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
