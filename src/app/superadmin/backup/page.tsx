
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadCloud, PlayCircle, RotateCcw, Settings2, History, Trash2 } from "lucide-react"; // Removed UploadCloud as it's not used
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, useState } from "react";

// Mock Data for Backup History - Using static dates to prevent hydration errors
const mockBackupHistory = [
  { id: "backup-001", date: "2024-07-31T02:00:00Z", statusKey: "superAdminBackup.status.completed", size: "1.2 GB", typeKey: "superAdminBackup.type.full" },
  { id: "backup-002", date: "2024-07-30T02:00:00Z", statusKey: "superAdminBackup.status.completed", size: "1.1 GB", typeKey: "superAdminBackup.type.full" },
  { id: "backup-003", date: "2024-07-29T02:00:00Z", statusKey: "superAdminBackup.status.failed", size: "N/A", typeKey: "superAdminBackup.type.incremental" },
  { id: "backup-004", date: "2024-07-25T02:00:00Z", statusKey: "superAdminBackup.status.completed", size: "980 MB", typeKey: "superAdminBackup.type.full" },
];


export default function SuperAdminBackupPage() {
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const backupHistory = mockBackupHistory;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('superAdminBackup.title')}</h1>
      <p className="text-lg text-muted-foreground">{t('superAdminBackup.description')}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t('superAdminBackup.operationsCard.title')}</CardTitle>
          <CardDescription>{t('superAdminBackup.operationsCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button size="lg" className="w-full">
            <PlayCircle className="mr-2 h-5 w-5" /> {t('superAdminBackup.operationsCard.startBackupButton')}
          </Button>
          <Button size="lg" variant="outline" className="w-full">
            <RotateCcw className="mr-2 h-5 w-5" /> {t('superAdminBackup.operationsCard.restoreButton')}
          </Button>
          <Button size="lg" variant="outline" className="w-full">
            <Settings2 className="mr-2 h-5 w-5" /> {t('superAdminBackup.operationsCard.settingsButton')}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> {t('superAdminBackup.historyCard.title')}</CardTitle>
          <CardDescription>{t('superAdminBackup.historyCard.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('superAdminBackup.table.dateTime')}</TableHead>
                <TableHead>{t('superAdminBackup.table.type')}</TableHead>
                <TableHead className="text-center">{t('superAdminBackup.table.status')}</TableHead>
                <TableHead className="text-right">{t('superAdminBackup.table.size')}</TableHead>
                <TableHead className="text-right">{t('superAdminBackup.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupHistory.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{format(new Date(backup.date), "MMM d, yyyy 'at' h:mm a")}</TableCell>
                  <TableCell>
                    <Badge variant={t(backup.typeKey) === t('superAdminBackup.type.full') ? "default" : "secondary"}>{t(backup.typeKey)}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={t(backup.statusKey) === t('superAdminBackup.status.completed') ? "default" : "destructive"}
                           className={t(backup.statusKey) === t('superAdminBackup.status.completed') ? "bg-green-500 text-white" : ""}>
                      {t(backup.statusKey)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{backup.size}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {t(backup.statusKey) === t('superAdminBackup.status.completed') && (
                        <Button variant="ghost" size="icon" title={t('superAdminBackup.actions.download')}>
                            <DownloadCloud className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="hover:text-destructive" title={t('superAdminBackup.actions.delete')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {backupHistory.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t('superAdminBackup.historyCard.noHistory')}
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('superAdminBackup.storageCard.title')}</CardTitle>
          <CardDescription>{t('superAdminBackup.storageCard.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{t('superAdminBackup.storageCard.locationLabel')} <span className="font-medium">/var/backups/websapmax ({t('superAdminBackup.storageCard.localServer')})</span></p>
            <p className="text-sm text-muted-foreground">{t('superAdminBackup.storageCard.capacityLabel')} <span className="font-medium">500 GB</span></p>
            <p className="text-sm text-muted-foreground">{t('superAdminBackup.storageCard.usedSpaceLabel')} <span className="font-medium">150 GB (30%)</span></p>
            {/* Add a progress bar for storage usage */}
        </CardContent>
      </Card>

    </div>
  );
}
