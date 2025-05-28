import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, BookUser, Megaphone, Bell } from "lucide-react";
import Link from "next/link";

export default function EmployeeDashboardPage() {
  // Mock data for dashboard widgets
  const mockStats = {
    pendingOrders: 5,
    upcomingReservations: 3,
    newNotifications: 2,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Employee Dashboard</h1>
      <p className="text-lg text-muted-foreground">Welcome! Here are your tasks and updates.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{mockStats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Orders awaiting processing</p>
                <Link href="/employee/orders" className="text-sm text-primary hover:underline mt-2 block">Manage Orders &rarr;</Link>
            </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Reservations</CardTitle>
                <BookUser className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{mockStats.upcomingReservations}</div>
                <p className="text-xs text-muted-foreground">Bookings for today/tomorrow</p>
                <Link href="/employee/reservations" className="text-sm text-primary hover:underline mt-2 block">Manage Reservations &rarr;</Link>
            </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promote Menu</CardTitle>
                <Megaphone className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Share!</div>
                <p className="text-xs text-muted-foreground">Spread the word on social media</p>
                 <Link href="/employee/promote" className="text-sm text-primary hover:underline mt-2 block">Promote Now &rarr;</Link>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Notifications</CardTitle>
          <CardDescription>Recent activity and important alerts.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockStats.newNotifications > 0 ? (
            <ul className="space-y-3">
              <li className="p-3 border rounded-md bg-accent/30">
                <p className="font-medium">New Order #12345 received.</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </li>
              <li className="p-3 border rounded-md">
                <p className="font-medium">Reservation for 'John Doe' confirmed for tomorrow.</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </li>
            </ul>
          ) : (
            <p className="text-muted-foreground">No new notifications.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
