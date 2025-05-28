import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadCloud, UploadCloud, PlayCircle, RotateCcw, Settings2, History, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Mock Data for Backup History
const mockBackupHistory = [
  { id: "backup-001", date: new Date(Date.now() - 86400000 * 1), status: "Completed", size: "1.2 GB", type: "Full" },
  { id: "backup-002", date: new Date(Date.now() - 86400000 * 2), status: "Completed", size: "1.1 GB", type: "Full" },
  { id: "backup-003", date: new Date(Date.now() - 86400000 * 3), status: "Failed", size: "N/A", type: "Incremental" },
  { id: "backup-004", date: new Date(Date.now() - 86400000 * 7), status: "Completed", size: "980 MB", type: "Full" },
];


export default function SuperAdminBackupPage() {
  const backupHistory = mockBackupHistory;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">System Backup & Restore</h1>
      <p className="text-lg text-muted-foreground">Manage data backups and system restore points.</p>

      <Card>
        <CardHeader>
          <CardTitle>Backup Operations</CardTitle>
          <CardDescription>Create new backups or restore from existing ones.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button size="lg" className="w-full">
            <PlayCircle className="mr-2 h-5 w-5" /> Start New Full Backup
          </Button>
          <Button size="lg" variant="outline" className="w-full">
            <RotateCcw className="mr-2 h-5 w-5" /> Restore from Backup
          </Button>
          <Button size="lg" variant="outline" className="w-full">
            <Settings2 className="mr-2 h-5 w-5" /> Backup Settings
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Backup History</CardTitle>
          <CardDescription>Log of all past backup attempts and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupHistory.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{format(backup.date, "MMM d, yyyy 'at' h:mm a")}</TableCell>
                  <TableCell>
                    <Badge variant={backup.type === "Full" ? "default" : "secondary"}>{backup.type}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={backup.status === "Completed" ? "default" : "destructive"}
                           className={backup.status === "Completed" ? "bg-green-500 text-white" : ""}>
                      {backup.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{backup.size}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {backup.status === "Completed" && (
                        <Button variant="ghost" size="icon" title="Download Backup">
                            <DownloadCloud className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="hover:text-destructive" title="Delete Backup">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {backupHistory.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No backup history found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup Storage</CardTitle>
          <CardDescription>Information about backup storage location and capacity.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">Storage Location: <span className="font-medium">/var/backups/websapmax</span> (Local Server)</p>
            <p className="text-sm text-muted-foreground">Total Capacity: <span className="font-medium">500 GB</span></p>
            <p className="text-sm text-muted-foreground">Used Space: <span className="font-medium">150 GB (30%)</span></p>
            {/* Add a progress bar for storage usage */}
        </CardContent>
      </Card>

    </div>
  );
}
