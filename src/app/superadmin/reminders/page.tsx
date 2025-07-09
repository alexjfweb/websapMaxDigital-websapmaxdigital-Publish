
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LayoutGrid, Settings, FileText, History, Server, AlertTriangle, CheckCircle, CalendarX2, Play, Pause, Save, Edit } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Mock Data
const mockSummary = {
  dueThisWeek: 12,
  overdue: 5,
  sentToday: 47,
};

const mockReminderHistory = [
    { id: "rem-1", company: "The Burger Joint", type: "7 Days Before", date: new Date("2024-07-30T09:00:00Z"), status: "Sent" },
    { id: "rem-2", company: "Pizza Palace", type: "On Expiration", date: new Date("2024-07-29T09:00:00Z"), status: "Opened" },
    { id: "rem-3", company: "Sushi Central", type: "3 Days Overdue", date: new Date("2024-07-28T09:00:00Z"), status: "Sent" },
    { id: "rem-4", company: "Taco Tuesday", type: "7 Days Before", date: new Date("2024-07-27T09:00:00Z"), status: "Failed" },
];

export default function SuperAdminRemindersPage() {
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sent": return <Badge variant="default" className="bg-blue-500 text-white hover:bg-blue-600">{t('superAdminReminders.history.statusSent')}</Badge>;
      case "Opened": return <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600">{t('superAdminReminders.history.statusOpened')}</Badge>;
      case "Failed": return <Badge variant="destructive">{t('superAdminReminders.history.statusFailed')}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/superadmin/dashboard" passHref>
          <Button variant="outline" size="icon" aria-label={t('superAdminReminders.backButton')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('superAdminReminders.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('superAdminReminders.description')}</p>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="border-b-0 justify-start w-full gap-2 flex-wrap h-auto">
          <TabsTrigger value="summary" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4"/>{t('superAdminReminders.tabs.summary')}</TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2"><Settings className="h-4 w-4"/>{t('superAdminReminders.tabs.configuration')}</TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2"><FileText className="h-4 w-4"/>{t('superAdminReminders.tabs.templates')}</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2"><History className="h-4 w-4"/>{t('superAdminReminders.tabs.history')}</TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2"><Server className="h-4 w-4"/>{t('superAdminReminders.tabs.system')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('superAdminReminders.summary.dueThisWeek')}</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{mockSummary.dueThisWeek}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('superAdminReminders.summary.overdue')}</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{mockSummary.overdue}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('superAdminReminders.summary.sentToday')}</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{mockSummary.sentToday}</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarX2 className="h-5 w-5"/>
                  {t('superAdminReminders.upcoming.title')}
                </CardTitle>
                <CardDescription>{t('superAdminReminders.upcoming.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48 border-2 border-dashed rounded-lg">
                  <CalendarX2 className="h-12 w-12 mb-4" />
                  <p>{t('superAdminReminders.upcoming.emptyState')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="config" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('superAdminReminders.config.title')}</CardTitle>
                    <CardDescription>{t('superAdminReminders.config.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg">
                        <div>
                            <Label htmlFor="before-expiry" className="font-semibold">{t('superAdminReminders.config.beforeExpiry.label')}</Label>
                            <p className="text-sm text-muted-foreground">{t('superAdminReminders.config.beforeExpiry.description')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input id="before-expiry-days" type="number" defaultValue="7" className="w-20" />
                            <Label htmlFor="before-expiry-days" className="text-sm text-muted-foreground">{t('superAdminReminders.config.days')}</Label>
                            <Switch id="before-expiry" defaultChecked />
                        </div>
                    </div>
                     <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg">
                        <div>
                            <Label htmlFor="on-expiry" className="font-semibold">{t('superAdminReminders.config.onExpiry.label')}</Label>
                            <p className="text-sm text-muted-foreground">{t('superAdminReminders.config.onExpiry.description')}</p>
                        </div>
                        <Switch id="on-expiry" defaultChecked />
                    </div>
                     <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg">
                        <div>
                            <Label htmlFor="after-expiry" className="font-semibold">{t('superAdminReminders.config.afterExpiry.label')}</Label>
                            <p className="text-sm text-muted-foreground">{t('superAdminReminders.config.afterExpiry.description')}</p>
                        </div>
                         <div className="flex items-center gap-2">
                            <Input id="after-expiry-days" type="number" defaultValue="3" className="w-20" />
                            <Label htmlFor="after-expiry-days" className="text-sm text-muted-foreground">{t('superAdminReminders.config.days')}</Label>
                            <Switch id="after-expiry" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button><Save className="mr-2 h-4 w-4"/> {t('superAdminReminders.config.saveButton')}</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('superAdminReminders.templates.title')}</CardTitle>
                    <CardDescription>{t('superAdminReminders.templates.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                         <p className="font-medium">{t('superAdminReminders.templates.beforeExpiryName')}</p>
                         <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/>{t('superAdminReminders.templates.editButton')}</Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                         <p className="font-medium">{t('superAdminReminders.templates.onExpiryName')}</p>
                         <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/>{t('superAdminReminders.templates.editButton')}</Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                         <p className="font-medium">{t('superAdminReminders.templates.afterExpiryName')}</p>
                         <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/>{t('superAdminReminders.templates.editButton')}</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('superAdminReminders.history.title')}</CardTitle>
                    <CardDescription>{t('superAdminReminders.history.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('superAdminReminders.history.table.company')}</TableHead>
                                <TableHead>{t('superAdminReminders.history.table.type')}</TableHead>
                                <TableHead>{t('superAdminReminders.history.table.date')}</TableHead>
                                <TableHead className="text-right">{t('superAdminReminders.history.table.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockReminderHistory.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.company}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{format(item.date, "PPp")}</TableCell>
                                    <TableCell className="text-right">{getStatusBadge(item.status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>{t('superAdminReminders.system.title')}</CardTitle>
                    <CardDescription>{t('superAdminReminders.system.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <p className="font-semibold">{t('superAdminReminders.system.statusLabel')}</p>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="font-medium">{t('superAdminReminders.system.statusRunning')}</span>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p><span className="font-semibold text-foreground">{t('superAdminReminders.system.lastRunLabel')}:</span> 2 hours ago</p>
                        <p><span className="font-semibold text-foreground">{t('superAdminReminders.system.nextRunLabel')}:</span> In 22 hours</p>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <Button variant="destructive"><Pause className="mr-2 h-4 w-4"/> {t('superAdminReminders.system.pauseButton')}</Button>
                        <Button variant="outline"><Play className="mr-2 h-4 w-4"/> {t('superAdminReminders.system.runNowButton')}</Button>
                    </div>
                </CardContent>
             </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
