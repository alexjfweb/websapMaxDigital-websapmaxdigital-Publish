
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, Clock, ListTree, FileText, Eye, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";

// Mock Data
const dbStatus = {
  status: "Connected",
  latency: "25ms",
  collections: 6,
  documents: 184,
};

const collectionsData = [
  { name: "users", count: 150 },
  { name: "companies", count: 5 },
  { name: "dishes", count: 25 },
  { name: "orders", count: 1250 },
  { name: "reservations", count: 20 },
  { name: "logs", count: 5000 },
];

export default function SuperAdminDatabasePage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleTestConnection = () => {
    toast({
      title: t('superAdminDatabase.toast.testingConnection'),
      description: t('superAdminDatabase.toast.testingDescription'),
    });
    // Simulate a successful connection test
    setTimeout(() => {
        toast({
            title: t('superAdminDatabase.toast.testSuccessTitle'),
            description: t('superAdminDatabase.toast.testSuccessDescription', { latency: dbStatus.latency }),
        });
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">{t('superAdminDatabase.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('superAdminDatabase.description')}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('superAdminDatabase.statusCard.title')}</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{t('superAdminDatabase.statusCard.connected')}</div>
            <p className="text-xs text-muted-foreground">{t('superAdminDatabase.statusCard.subtitle')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('superAdminDatabase.latencyCard.title')}</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStatus.latency}</div>
            <p className="text-xs text-muted-foreground">{t('superAdminDatabase.latencyCard.subtitle')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('superAdminDatabase.collectionsCard.title')}</CardTitle>
            <ListTree className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStatus.collections}</div>
            <p className="text-xs text-muted-foreground">{t('superAdminDatabase.collectionsCard.subtitle')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('superAdminDatabase.documentsCard.title')}</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStatus.documents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('superAdminDatabase.documentsCard.subtitle')}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Collections Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('superAdminDatabase.collectionsTable.title')}</CardTitle>
          <CardDescription>{t('superAdminDatabase.collectionsTable.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('superAdminDatabase.collectionsTable.header.name')}</TableHead>
                <TableHead className="text-right">{t('superAdminDatabase.collectionsTable.header.docCount')}</TableHead>
                <TableHead className="text-right">{t('superAdminDatabase.collectionsTable.header.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collectionsData.map((collection) => (
                <TableRow key={collection.name}>
                  <TableCell className="font-mono text-sm">{collection.name}</TableCell>
                  <TableCell className="text-right">{collection.count.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title={t('superAdminDatabase.collectionsTable.viewAction')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
            <CardTitle>{t('superAdminDatabase.actionsCard.title')}</CardTitle>
            <CardDescription>{t('superAdminDatabase.actionsCard.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleTestConnection}>
                <RefreshCw className="mr-2 h-4 w-4"/>
                {t('superAdminDatabase.actionsCard.testConnectionButton')}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
