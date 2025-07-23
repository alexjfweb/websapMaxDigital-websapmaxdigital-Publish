"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { tableService, type Table, type TableLog } from "@/services/table-service";
import { Badge } from "@/components/ui/badge";

interface TableLogsDialogProps {
  table: Table;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TableLogsDialog({ table, open, onOpenChange }: TableLogsDialogProps) {
  const [logs, setLogs] = useState<TableLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadLogs();
    }
    // eslint-disable-next-line
  }, [open, table.id]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await tableService.getTableLogs(table.id);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Historial de Mesa {table.number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">Cargando historial...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay registros para esta mesa.</div>
          ) : (
            <ul className="space-y-2">
              {logs.map((log) => (
                <li key={log.id} className="border rounded-md p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge>{tableService.getActionText(log.action)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="text-sm">{log.details}</div>
                  {log.performedBy && (
                    <div className="text-xs text-muted-foreground">Por: {log.performedBy}</div>
                  )}
                  {log.previousStatus && log.newStatus && (
                    <div className="text-xs">
                      Estado: <b>{tableService.getStatusText(log.previousStatus)}</b> → <b>{tableService.getStatusText(log.newStatus)}</b>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
