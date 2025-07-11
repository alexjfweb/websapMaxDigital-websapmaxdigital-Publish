
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye, Search, Filter, CalendarDays, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState } from "react";

// Mock Data for Reservations (can be same as admin or filtered for employee view)
const mockReservations = [
  { id: "res-e1", customerName: "Alice Wonderland", date: "2024-08-15T19:00:00Z", guests: 4, phone: "555-0101", status: "confirmed", notes: "Window seat preferred" },
  { id: "res-e2", customerName: "Bob The Builder", date: "2024-08-16T20:30:00Z", guests: 2, phone: "555-0102", status: "pending", notes: "Birthday celebration" },
  { id: "res-e3", customerName: "Charlie Brown", date: "2024-08-15T18:00:00Z", guests: 6, phone: "555-0103", status: "cancelled", notes: "" },
];

export default function EmployeeReservationsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const reservations = mockReservations;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-green-500 text-white hover:bg-green-600">Confirmed</Badge>;
      case "pending": return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pending</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">Manage Reservations</h1>
            <p className="text-lg text-muted-foreground">Oversee and update customer table bookings.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Reservation
        </Button>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Recent Reservations</CardTitle>
          <CardDescription>Manage all table bookings assigned to you or your section.</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or phone..." className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter by Status
            </Button>
             <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" /> View Calendar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-center">Guests</TableHead>
                <TableHead className="hidden sm:table-cell">Notes</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.customerName}</TableCell>
                  <TableCell>{format(new Date(reservation.date), "MMM d, yyyy 'at' h:mm a")}</TableCell>
                  <TableCell className="text-center">{reservation.guests}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground truncate max-w-xs">
                    {reservation.notes || "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(reservation.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="hover:text-blue-500" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {reservation.status === 'pending' && (
                        <>
                        <Button variant="ghost" size="icon" className="hover:text-green-500" title="Confirm Reservation">
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:text-red-500" title="Cancel Reservation">
                            <XCircle className="h-4 w-4" />
                        </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
               {reservations.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No reservations found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {/* Placeholder for View/Edit Reservation Details Dialog */}
    </div>
  );
}
