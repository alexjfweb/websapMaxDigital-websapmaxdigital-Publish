"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, Truck, Search, Filter, Printer, ShoppingBag } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useEffect, useState } from "react";


// Mock Data for Orders - Using static dates to prevent hydration errors
const mockOrders = [
  { id: "order-001", customerName: "Eva Green", date: "2024-07-31T12:30:00Z", items: 3, total: 45.50, status: "pending", type: "delivery" },
  { id: "order-002", customerName: "Frank Blue", date: "2024-07-31T11:30:00Z", items: 2, total: 22.00, status: "preparing", type: "pickup" },
  { id: "order-003", customerName: "Grace Red", date: "2024-07-31T10:30:00Z", items: 5, total: 78.25, status: "ready_for_pickup", type: "pickup" },
  { id: "order-004", customerName: "Henry Yellow", date: "2024-07-31T09:30:00Z", items: 1, total: 15.75, status: "out_for_delivery", type: "delivery" },
  { id: "order-005", customerName: "Ivy White", date: "2024-07-30T15:00:00Z", items: 4, total: 55.00, status: "completed", type: "delivery" },
  { id: "order-006", customerName: "Jack Black", date: "2024-07-29T18:00:00Z", items: 2, total: 30.50, status: "cancelled", type: "pickup" },
];


export default function EmployeeOrdersPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtered orders based on tab would be handled by state
  const activeOrders = mockOrders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const pastOrders = mockOrders.filter(o => ['completed', 'cancelled'].includes(o.status));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-orange-500 text-white hover:bg-orange-600">Pending</Badge>;
      case "preparing": return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Preparing</Badge>;
      case "ready_for_pickup": return <Badge className="bg-purple-500 text-white hover:bg-purple-600">Ready for Pickup</Badge>;
      case "out_for_delivery": return <Badge className="bg-teal-500 text-white hover:bg-teal-600">Out for Delivery</Badge>;
      case "completed": return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">Completed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  const renderOrderTable = (orders: typeof mockOrders) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="hidden sm:table-cell">Date</TableHead>
          <TableHead className="text-center">Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-xs">{order.id}</TableCell>
            <TableCell className="font-medium">{order.customerName}</TableCell>
            <TableCell className="hidden sm:table-cell">{format(new Date(order.date), "MMM d, h:mm a")}</TableCell>
            <TableCell className="text-center">{order.items}</TableCell>
            <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
            <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="hover:text-blue-500">
                  <Eye className="h-4 w-4" />
                </Button>
                {order.status === "pending" && (
                  <Button variant="ghost" size="icon" className="hover:text-green-500" title="Mark as Preparing">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {order.status === "preparing" && order.type === "delivery" && (
                   <Button variant="ghost" size="icon" className="hover:text-teal-500" title="Mark Out for Delivery">
                    <Truck className="h-4 w-4" />
                  </Button>
                )}
                 {order.status === "preparing" && order.type === "pickup" && (
                   <Button variant="ghost" size="icon" className="hover:text-purple-500" title="Mark Ready for Pickup">
                    <ShoppingBag className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {orders.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              No orders in this category.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Manage Customer Orders</h1>
        <p className="text-lg text-muted-foreground">Process incoming orders and track their status.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle>Order Overview</CardTitle>
            <div className="flex gap-2">
                <Button variant="outline"><Printer className="mr-2 h-4 w-4"/> Print KOTs</Button>
            </div>
          </div>
          <CardDescription>Filter and manage all customer orders.</CardDescription>
           <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by Order ID or Customer Name..." className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter by Status
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
              <TabsTrigger value="past">Past Orders ({pastOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {renderOrderTable(activeOrders)}
            </TabsContent>
            <TabsContent value="past">
              {renderOrderTable(pastOrders)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* Placeholder for View Order Details Dialog */}
    </div>
  );
}
