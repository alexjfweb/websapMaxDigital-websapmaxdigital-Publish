
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, History, ShieldCheck, BarChart3, AlertTriangle, Activity } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export default function SuperAdminDashboardPage() {
  const { t } = useLanguage();

  // Mock data for dashboard widgets - for some values, we'll use translation keys if they represent static UI states
  const mockSaStats = {
    totalUsers: 150,
    totalAdmins: 25,
    totalEmployees: 100,
    systemHealthStatusKey: "superAdminDashboard.systemHealthValue.good", // Key for "Good"
    lastBackup: "2024-07-30 02:00 AM", // This would typically be dynamic
    criticalLogs: 3,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('superAdminDashboard.title')}</h1>
      <p className="text-lg text-muted-foreground">{t('superAdminDashboard.description')}</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/superadmin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('superAdminDashboard.userManagementCard.title')}</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSaStats.totalUsers} {t('superAdminDashboard.userManagementCard.users')}</div>
              <p className="text-xs text-muted-foreground">
                {mockSaStats.totalAdmins} {t('superAdminDashboard.userManagementCard.admins')}, {mockSaStats.totalEmployees} {t('superAdminDashboard.userManagementCard.employees')}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/backup">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('superAdminDashboard.systemBackupCard.title')}</CardTitle>
              <Server className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t('superAdminDashboard.systemBackupCard.mainText')}</div>
              <p className="text-xs text-muted-foreground">{t('superAdminDashboard.systemBackupCard.lastBackupLabel')} {mockSaStats.lastBackup}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/logs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('superAdminDashboard.systemLogsCard.title')}</CardTitle>
              <History className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t('superAdminDashboard.systemLogsCard.mainText')}</div>
              <p className="text-xs text-muted-foreground text-red-500">{mockSaStats.criticalLogs} {t('superAdminDashboard.systemLogsCard.criticalLogs')}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> {t('superAdminDashboard.systemStatusCard.title')}</CardTitle>
          <CardDescription>{t('superAdminDashboard.systemStatusCard.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <ShieldCheck className="h-10 w-10 text-green-500"/>
                <div>
                    <p className="text-sm font-medium leading-none">{t('superAdminDashboard.systemStatusCard.healthLabel')}</p>
                    <p className="text-xl font-semibold">{t(mockSaStats.systemHealthStatusKey)}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <BarChart3 className="h-10 w-10 text-blue-500"/>
                 <div>
                    <p className="text-sm font-medium leading-none">{t('superAdminDashboard.systemStatusCard.activeUsersLabel')}</p>
                    <p className="text-xl font-semibold">42</p> {/* Mock data, could be dynamic */}
                </div>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4 col-span-full md:col-span-1">
                <AlertTriangle className="h-10 w-10 text-yellow-500"/>
                 <div>
                    <p className="text-sm font-medium leading-none">{t('superAdminDashboard.systemStatusCard.securityAlertsLabel')}</p>
                    <p className="text-xl font-semibold">0</p> {/* Mock data, could be dynamic */}
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
