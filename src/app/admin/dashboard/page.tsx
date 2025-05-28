import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Settings, ShoppingBag, Utensils, Users } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
      <p className="text-lg text-muted-foreground">Manage your restaurant effectively.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurant Profile</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage Details</div>
              <p className="text-xs text-muted-foreground">Update name, logo, address, etc.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/dishes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dish Management</CardTitle>
              <Utensils className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Menu Items</div>
              <p className="text-xs text-muted-foreground">Add, edit, or delete dishes.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/employees">
           <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employee Management</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Staff Accounts</div>
              <p className="text-xs text-muted-foreground">Manage employee access.</p>
            </CardContent>
          </Card>
        </Link>
         <Link href="/admin/reservations">
           <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservations</CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" /> {/* Using ShoppingBag as placeholder */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View Bookings</div>
              <p className="text-xs text-muted-foreground">Manage customer reservations.</p>
            </CardContent>
          </Card>
        </Link>
         <Link href="/admin/payments">
           <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Configure Payments</div>
              <p className="text-xs text-muted-foreground">Set up Nequi, QR, COD.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/share-menu">
           <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Share Menu</CardTitle>
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Distribute Menu</div>
              <p className="text-xs text-muted-foreground">Share via WhatsApp or link.</p>
            </CardContent>
          </Card>
        </Link>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <BarChart className="h-8 w-8 text-primary"/>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Total Dishes</p>
                    <p className="text-2xl font-semibold">25</p> {/* Mock Data */}
                </div>
            </div>
             <div className="flex items-center space-x-4 rounded-md border p-4">
                <ShoppingBag className="h-8 w-8 text-primary"/>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Pending Orders</p>
                    <p className="text-2xl font-semibold">5</p> {/* Mock Data */}
                </div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
