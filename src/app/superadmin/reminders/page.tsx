
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LayoutGrid, Settings, FileText, History, Server, AlertTriangle, CheckCircle, CalendarX2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export default function SuperAdminRemindersPage() {
  const { t } = useLanguage();

  const mockSummary = {
    dueThisWeek: 12,
    overdue: 5,
    sentToday: 47,
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
        <TabsList className="border-b-0 justify-start w-full gap-2">
          <TabsTrigger value="summary" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4"/>{t('superAdminReminders.tabs.summary')}</TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2" disabled><Settings className="h-4 w-4"/>{t('superAdminReminders.tabs.configuration')}</TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2" disabled><FileText className="h-4 w-4"/>{t('superAdminReminders.tabs.templates')}</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2" disabled><History className="h-4 w-4"/>{t('superAdminReminders.tabs.history')}</TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2" disabled><Server className="h-4 w-4"/>{t('superAdminReminders.tabs.system')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-6">
          <div className="space-y-6">
            {/* Key Metrics */}
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

            {/* Upcoming Expirations */}
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
      </Tabs>
    </div>
  );
}
