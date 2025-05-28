import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, AlertCircle, Info, ServerCrash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

// Mock Data for Logs
const mockLogs = [
  { id: "log-001", timestamp: new Date(), level: "INFO", message: "User 'admin@example.com' logged in.", source: "AuthService" },
  { id: "log-002", timestamp: new Date(Date.now() - 60000 * 5), level: "WARN", message: "High CPU usage detected: 85%", source: "SystemMonitor" },
  { id: "log-003", timestamp: new Date(Date.now() - 60000 * 15), level: "ERROR", message: "Failed to connect to payment gateway.", source: "PaymentService" },
  { id: "log-004", timestamp: new Date(Date.now() - 60000 * 30), level: "DEBUG", message: "Processing order #12345", source: "OrderService" },
  { id: "log-005", timestamp: new Date(Date.now() - 60000 * 60), level: "INFO", message: "Database backup completed successfully.", source: "BackupService" },
  { id: "log-006", timestamp: new Date(Date.now() - 60000 * 120), level: "CRITICAL", message: "System crash detected. Attempting reboot.", source: "Kernel" },
];

export default function SuperAdminLogsPage() {
  const logs = mockLogs;

  const getLevelBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case "INFO": return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300"><Info className="mr-1 h-3 w-3"/>INFO</Badge>;
      case "WARN": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300"><AlertCircle className="mr-1 h-3 w-3"/>WARN</Badge>;
      case "ERROR": return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3"/>ERROR</Badge>;
      case "DEBUG": return <Badge variant="outline">DEBUG</Badge>;
      case "CRITICAL": return <Badge variant="destructive" className="bg-red-700 text-white"><ServerCrash className="mr-1 h-3 w-3"/>CRITICAL</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">System Logs</h1>
      <p className="text-lg text-muted-foreground">Monitor system activity and troubleshoot issues.</p>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle>Log Viewer</CardTitle>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download Logs
            </Button>
          </div>
          <CardDescription>Real-time and historical system logs.</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs by message, source, or ID..." className="pl-8" />
            </div>
            <Select defaultValue="ALL">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="WARN">WARN</SelectItem>
                <SelectItem value="ERROR">ERROR</SelectItem>
                <SelectItem value="DEBUG">DEBUG</SelectItem>
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
              </SelectContent>
            </Select>
             <Select defaultValue="ALL_SOURCES">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_SOURCES">All Sources</SelectItem>
                <SelectItem value="AuthService">AuthService</SelectItem>
                <SelectItem value="SystemMonitor">SystemMonitor</SelectItem>
                <SelectItem value="PaymentService">PaymentService</SelectItem>
                 <SelectItem value="OrderService">OrderService</SelectItem>
                <SelectItem value="BackupService">BackupService</SelectItem>
                <SelectItem value="Kernel">Kernel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[100px] text-center">Level</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[150px] hidden sm:table-cell">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className={
                    log.level === "ERROR" ? "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50" :
                    log.level === "CRITICAL" ? "bg-red-100 dark:bg-red-800/30 font-semibold hover:bg-red-200 dark:hover:bg-red-800/50" :
                    log.level === "WARN" ? "bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50" : ""
                }>
                  <TableCell className="font-mono text-xs">{format(log.timestamp, "MMM d, HH:mm:ss.SSS")}</TableCell>
                  <TableCell className="text-center">{getLevelBadge(log.level)}</TableCell>
                  <TableCell className="text-sm leading-tight">{log.message}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{log.source}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No logs found matching your criteria.
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
