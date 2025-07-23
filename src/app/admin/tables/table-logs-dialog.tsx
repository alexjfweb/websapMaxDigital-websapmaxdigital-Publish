"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { tableService, type Table, type TableLog } from "@/services/table-service";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface TableLogsDialogProps {
  table: Table;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TableLogsDialog({ table, open, onOpenChange }: TableLogsDialogProps) {
  const [logs, setLogs] = useState<TableLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && table.id) {
      setLoading(true);
      setError(null);
      fetch(`/api/tables/${table.id}/logs`)
        .then(res => {
          if (!res.ok) throw new Error('Error al cargar el historial');
          return res.json();
        })
        .then(data => {
          setLogs(data);
        })
        .catch(err => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, table.id]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="flex flex-col items-center justify-center text-center text-destructive py-8">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (logs.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No hay registros de auditoría para esta mesa.
        </div>
      );
    }

    return (
      <ul className="space-y-3">
        {logs.map((log) => (
          <li key={log.id} className="border rounded-md p-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <Badge>{tableService.getActionText(log.action)}</Badge>
              <span className="text-xs text-muted-foreground">
                {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : 'Fecha no disponible'}
              </span>
            </div>
            <p className="text-muted-foreground">{log.details}</p>
            {log.performedBy && (
              <p className="text-xs text-muted-foreground mt-1">Por: {log.performedBy}</p>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Historial de Cambios - Mesa {table.number}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
