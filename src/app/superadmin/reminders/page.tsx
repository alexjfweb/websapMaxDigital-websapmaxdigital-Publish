
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LayoutGrid, Settings, FileText, History, Server, AlertTriangle, CheckCircle, CalendarX2, Play, Pause, Save, Edit, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Mock Data
const mockSummary = {
  dueThisWeek: 12,
  overdue: 5,
  sentToday: 47,
};

const mockReminderHistory = [
    { id: "rem-1", company: "The Burger Joint", type: "7 Days Before", date: "2024-07-30T09:00:00Z", status: "Sent" },
    { id: "rem-2", company: "Pizza Palace", type: "On Expiration", date: "2024-07-29T09:00:00Z", status: "Opened" },
    { id: "rem-3", company: "Sushi Central", type: "3 Days Overdue", date: "2024-07-28T09:00:00Z", status: "Sent" },
    { id: "rem-4", company: "Taco Tuesday", type: "7 Days Before", date: "2024-07-27T09:00:00Z", status: "Failed" },
];

const mockConfigs = [
  { id: 'cfg-1', name: '7-Day Warning', trigger: '7 days before expiration', status: 'active' },
  { id: 'cfg-2', name: 'Expiration Day Notice', trigger: 'On expiration day', status: 'active' },
  { id: 'cfg-3', name: '3-Day Overdue Alert', trigger: '3 days after expiration', status: 'inactive' },
];

type ReminderConfig = {
    id: string;
    name: string;
    trigger: string;
    status: 'active' | 'inactive';
};

export default function SuperAdminRemindersPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ReminderConfig | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<ReminderConfig | null>(null);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sent": return <Badge variant="default" className="bg-blue-500 text-white hover:bg-blue-600">{t('superAdminReminders.history.statusSent')}</Badge>;
      case "Opened": return <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600">{t('superAdminReminders.history.statusOpened')}</Badge>;
      case "Failed": return <Badge variant="destructive">{t('superAdminReminders.history.statusFailed')}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditConfig = (config: ReminderConfig) => {
    setSelectedConfig(config);
    setIsConfigDialogOpen(true);
  };

  const handleNewConfig = () => {
    setSelectedConfig(null);
    setIsConfigDialogOpen(true);
  }

  const handleDeleteClick = (config: ReminderConfig) => {
    setConfigToDelete(config);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    // Logic to delete the config would go here.
    toast({
        title: `Configuration "${configToDelete?.name}" deleted.`,
        description: "This is a mock action.",
    });
    setIsDeleteDialogOpen(false);
    setConfigToDelete(null);
  }


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
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{t('superAdminReminders.config.title')}</CardTitle>
                            <CardDescription>{t('superAdminReminders.config.description')}</CardDescription>
                        </div>
                        <Button onClick={handleNewConfig}>
                            <PlusCircle className="mr-2 h-4 w-4"/> {t('superAdminReminders.config.newButton')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('superAdminReminders.config.table.name')}</TableHead>
                                <TableHead>{t('superAdminReminders.config.table.trigger')}</TableHead>
                                <TableHead>{t('superAdminReminders.config.table.status')}</TableHead>
                                <TableHead className="text-right">{t('superAdminReminders.config.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockConfigs.map((config) => (
                                <TableRow key={config.id}>
                                    <TableCell className="font-medium">{config.name}</TableCell>
                                    <TableCell>{config.trigger}</TableCell>
                                    <TableCell>
                                        <Badge variant={config.status === 'active' ? 'default' : 'outline'} className={config.status === 'active' ? 'bg-green-500 text-white' : ''}>
                                            {config.status === 'active' ? t('superAdminReminders.config.statusActive') : t('superAdminReminders.config.statusInactive')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditConfig(config)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDeleteClick(config)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                                    <TableCell>{format(new Date(item.date), "PPp")}</TableCell>
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

      {/* Configuration Dialog (for create/edit) */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedConfig ? t('superAdminReminders.form.titleEdit') : t('superAdminReminders.form.titleCreate')}</DialogTitle>
            <DialogDescription>{t('superAdminReminders.form.description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">{t('superAdminReminders.form.nameLabel')}</Label>
              <Input id="name" defaultValue={selectedConfig?.name || ""} placeholder={t('superAdminReminders.form.namePlaceholder')} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="triggerType" className="text-right">{t('superAdminReminders.form.triggerTypeLabel')}</Label>
                <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t('superAdminReminders.form.triggerTypePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="before">{t('superAdminReminders.form.triggerTypeBefore')}</SelectItem>
                        <SelectItem value="on">{t('superAdminReminders.form.triggerTypeOn')}</SelectItem>
                        <SelectItem value="after">{t('superAdminReminders.form.triggerTypeAfter')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="days" className="text-right">{t('superAdminReminders.form.daysLabel')}</Label>
              <Input id="days" type="number" defaultValue="7" placeholder={t('superAdminReminders.form.daysPlaceholder')} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sendingMethod" className="text-right">{t('superAdminReminders.form.sendingMethodLabel')}</Label>
                <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t('superAdminReminders.form.sendingMethodPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="email">{t('superAdminReminders.form.sendingMethodEmail')}</SelectItem>
                        <SelectItem value="sms">{t('superAdminReminders.form.sendingMethodSms')}</SelectItem>
                        <SelectItem value="whatsapp">{t('superAdminReminders.form.sendingMethodWhatsapp')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxRetries" className="text-right">{t('superAdminReminders.form.maxRetriesLabel')}</Label>
              <Input id="maxRetries" type="number" defaultValue="3" placeholder={t('superAdminReminders.form.maxRetriesPlaceholder')} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="retryInterval" className="text-right">{t('superAdminReminders.form.retryIntervalLabel')}</Label>
              <Input id="retryInterval" type="number" defaultValue="24" placeholder={t('superAdminReminders.form.retryIntervalPlaceholder')} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t('superAdminReminders.form.statusLabel')}</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch id="status-mode" defaultChecked={selectedConfig?.status === 'active'} />
                <Label htmlFor="status-mode">{t('superAdminReminders.form.statusActive')}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>{t('superAdminReminders.form.cancelButton')}</Button>
            <Button onClick={() => {
                // Mock save action
                toast({ title: "Configuration saved!", description: "This is a mock action."});
                setIsConfigDialogOpen(false);
            }}><Save className="mr-2 h-4 w-4" />{t('superAdminReminders.form.saveButton')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{t('superAdminReminders.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('superAdminReminders.deleteDialog.description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfigToDelete(null)}>{t('superAdminReminders.deleteDialog.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t('superAdminReminders.deleteDialog.confirmButton')}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
