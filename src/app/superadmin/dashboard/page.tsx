import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, History, ShieldCheck, BarChart3, AlertTriangle, Activity } from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboardPage() {
  // Mock data for dashboard widgets
  const mockSaStats = {
    totalUsers: 150,
    totalAdmins: 25,
    totalEmployees: 100,
    systemHealth: "Good",
    lastBackup: "2024-07-30 02:00 AM",
    criticalLogs: 3,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">SuperAdmin Dashboard</h1>
      <p className="text-lg text-muted-foreground">Overall system management and monitoring.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/superadmin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Management</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSaStats.totalUsers} Users</div>
              <p className="text-xs text-muted-foreground">{mockSaStats.totalAdmins} Admins, {mockSaStats.totalEmployees} Employees</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/backup">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Backup</CardTitle>
              <Server className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage Backups</div>
              <p className="text-xs text-muted-foreground">Last backup: {mockSaStats.lastBackup}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/logs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Logs</CardTitle>
              <History className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View Logs</div>
              <p className="text-xs text-muted-foreground text-red-500">{mockSaStats.criticalLogs} critical logs</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> System Status</CardTitle>
          <CardDescription>High-level overview of system health and activity.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <ShieldCheck className="h-10 w-10 text-green-500"/>
                <div>
                    <p className="text-sm font-medium leading-none">System Health</p>
                    <p className="text-xl font-semibold">{mockSaStats.systemHealth}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <BarChart3 className="h-10 w-10 text-blue-500"/>
                 <div>
                    <p className="text-sm font-medium leading-none">Active Users (Now)</p>
                    <p className="text-xl font-semibold">42</p> {/* Mock data */}
                </div>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4 col-span-full md:col-span-1">
                <AlertTriangle className="h-10 w-10 text-yellow-500"/>
                 <div>
                    <p className="text-sm font-medium leading-none">Security Alerts</p>
                    <p className="text-xl font-semibold">0</p> {/* Mock data */}
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
