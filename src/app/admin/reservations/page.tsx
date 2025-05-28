import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye, Search, Filter, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Mock Data for Reservations
const mockReservations = [
  { id: "res-1", customerName: "Alice Wonderland", date: new Date("2024-08-15T19:00:00"), guests: 4, phone: "555-0101", status: "confirmed" },
  { id: "res-2", customerName: "Bob The Builder", date: new Date("2024-08-16T20:30:00"), guests: 2, phone: "555-0102", status: "pending" },
  { id: "res-3", customerName: "Charlie Brown", date: new Date("2024-08-15T18:00:00"), guests: 6, phone: "555-0103", status: "cancelled" },
  { id: "res-4", customerName: "Diana Prince", date: new Date("2024-08-17T19:30:00"), guests: 3, phone: "555-0104", status: "completed" },
];

export default function AdminReservationsPage() {
  const reservations = mockReservations;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-green-500 text-white hover:bg-green-600">Confirmed</Badge>;
      case "pending": return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pending</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      case "completed": return <Badge variant="secondary">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Reservation Management</h1>
        <p className="text-lg text-muted-foreground">View and manage customer table bookings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reservations</CardTitle>
          <CardDescription>List of all customer reservations.</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or phone..." className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter by Status
            </Button>
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" /> Filter by Date
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
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.customerName}</TableCell>
                  <TableCell>{format(reservation.date, "MMM d, yyyy 'at' h:mm a")}</TableCell>
                  <TableCell className="text-center">{reservation.guests}</TableCell>
                  <TableCell className="hidden sm:table-cell">{reservation.phone}</TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(reservation.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="hover:text-blue-500">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {reservation.status === 'pending' && (
                        <>
                        <Button variant="ghost" size="icon" className="hover:text-green-500">
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:text-red-500">
                            <XCircle className="h-4 w-4" />
                        </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {/* Placeholder for View Reservation Details Dialog */}
    </div>
  );
}
