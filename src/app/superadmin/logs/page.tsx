"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Download, AlertCircle, Info, ServerCrash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock Data for Logs - Using static dates to prevent hydration errors
const mockLogs = [
  { id: "log-001", timestamp: "2024-07-31T12:00:00Z", level: "INFO", message: "User 'admin@example.com' logged in.", source: "AuthService" },
  { id: "log-002", timestamp: "2024-07-31T11:55:00Z", level: "WARN", message: "High CPU usage detected: 85%", source: "SystemMonitor" },
  { id: "log-003", timestamp: "2024-07-31T11:45:00Z", level: "ERROR", message: "Failed to connect to payment gateway.", source: "PaymentService" },
  { id: "log-004", timestamp: "2024-07-31T11:30:00Z", level: "DEBUG", message: "Processing order #12345", source: "OrderService" },
  { id: "log-005", timestamp: "2024-07-31T11:00:00Z", level: "INFO", message: "Database backup completed successfully.", source: "BackupService" },
  { id: "log-006", timestamp: "2024-07-31T10:00:00Z", level: "CRITICAL", message: "System crash detected. Attempting reboot.", source: "Kernel" },
];

// Traducciones directas para niveles de log
const logLevelTranslations = {
  "superAdminLogs.level.info": "Información",
  "superAdminLogs.level.warn": "Advertencia",
  "superAdminLogs.level.error": "Error",
  "superAdminLogs.level.debug": "Depuración",
  "superAdminLogs.level.critical": "Crítico"
};

export default function SuperAdminLogsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL_SOURCES');
  const logs = mockLogs;
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getLevelBadge = (level: string) => {
    const levelKey = `superAdminLogs.level.${level.toLowerCase()}`;
    const levelText = logLevelTranslations[levelKey] || level;
    switch (level.toUpperCase()) {
      case "INFO": return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300"><Info className="mr-1 h-3 w-3"/>{levelText}</Badge>;
      case "WARN": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300"><AlertCircle className="mr-1 h-3 w-3"/>{levelText}</Badge>;
      case "ERROR": return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3"/>{levelText}</Badge>;
      case "DEBUG": return <Badge variant="outline">{levelText}</Badge>;
      case "CRITICAL": return <Badge variant="destructive" className="bg-red-700 text-white"><ServerCrash className="mr-1 h-3 w-3"/>{levelText}</Badge>;
      default: return <Badge variant="outline">{levelText}</Badge>;
    }
  };

  const logLevels = ["ALL", "INFO", "WARN", "ERROR", "DEBUG", "CRITICAL"];
  const logSources = ["ALL_SOURCES", "AuthService", "SystemMonitor", "PaymentService", "OrderService", "BackupService", "Kernel"];

  // Filtrado de logs
  const filteredLogs = logs.filter(log => {
    const levelMatch = levelFilter === 'ALL' || log.level === levelFilter;
    const sourceMatch = sourceFilter === 'ALL_SOURCES' || log.source === sourceFilter;
    return levelMatch && sourceMatch;
  });

  // Descargar logs mock
  const handleDownloadLogs = () => {
    const logText = logs.map(log => {
      return `[${log.level}] ${log.timestamp} (${log.source}): ${log.message}`;
    }).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const filename = 'Registros-' + dateStr + '.log';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Descarga de logs iniciada',
      description: 'El archivo de logs se está descargando.'
    });
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Registros</h1>
      <p className="text-lg text-muted-foreground">Descripción de la página de registros</p>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle>Visor de registros</CardTitle>
            <Button variant="outline" onClick={handleDownloadLogs}>
              <Download className="mr-2 h-4 w-4" /> Descargar registros
            </Button>
          </div>
          <CardDescription>Descripción del visor de registros</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar registros..." className="pl-8" />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por nivel..." />
              </SelectTrigger>
              <SelectContent>
                {logLevels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por fuente..." />
              </SelectTrigger>
              <SelectContent>
                {logSources.map(source => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Fecha</TableHead>
                <TableHead className="w-[100px] text-center">Nivel</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead className="w-[150px] hidden sm:table-cell">Fuente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className={
                    log.level === "ERROR" ? "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50" :
                    log.level === "CRITICAL" ? "bg-red-100 dark:bg-red-800/30 font-semibold hover:bg-red-200 dark:hover:bg-red-800/50" :
                    log.level === "WARN" ? "bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50" : ""
                }>
                  <TableCell className="font-mono text-xs">{format(new Date(log.timestamp), "MMM d, HH:mm:ss.SSS")}</TableCell>
                  <TableCell className="text-center">{getLevelBadge(log.level)}</TableCell>
                  <TableCell className="text-sm leading-tight">{log.message}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{log.source}</TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No hay registros para mostrar
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
