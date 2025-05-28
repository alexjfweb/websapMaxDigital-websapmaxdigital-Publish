import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Filter, UserCog, ShieldCheck, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types"; // Assuming User type is defined

// Mock Data for Users
const mockUsers: User[] = [
  { id: "usr-sa1", username: "super.admin", email: "sa@websapmax.com", role: "superadmin", status: "active", registrationDate: "2022-01-01", avatarUrl: "https://placehold.co/40x40.png?text=SA" },
  { id: "usr-ad1", username: "restaurant.owner", email: "owner@example.com", role: "admin", status: "active", registrationDate: "2023-02-10", avatarUrl: "https://placehold.co/40x40.png?text=RO" },
  { id: "usr-em1", username: "chef.john", email: "chef.john@example.com", role: "employee", status: "active", registrationDate: "2023-03-15", contact: "555-1234" },
  { id: "usr-ad2", username: "another.admin", email: "admin2@example.com", role: "admin", status: "pending", registrationDate: "2024-01-20" },
  { id: "usr-em2", username: "waiter.jane", email: "waiter.jane@example.com", role: "employee", status: "inactive", registrationDate: "2023-04-01", contact: "555-5678" },
];

export default function SuperAdminUsersPage() {
  const users = mockUsers;

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "superadmin": return <Badge className="bg-red-600 text-white hover:bg-red-700"><ShieldCheck className="mr-1 h-3 w-3"/>SuperAdmin</Badge>;
      case "admin": return <Badge className="bg-blue-600 text-white hover:bg-blue-700"><UserCog className="mr-1 h-3 w-3"/>Admin</Badge>;
      case "employee": return <Badge className="bg-green-600 text-white hover:bg-green-700">Employee</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active": return <Badge variant="default" className="bg-green-500 text-white">Active</Badge>;
      case "inactive": return <Badge variant="outline" className="text-gray-500 border-gray-400">Inactive</Badge>;
      case "pending": return <Badge variant="secondary" className="bg-yellow-500 text-white">Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">User Management</h1>
          <p className="text-lg text-muted-foreground">Oversee all user accounts in the system.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All System Users</CardTitle>
          <CardDescription>Manage user roles, status, and access.</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by username, email, or role..." className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter by Role
            </Button>
             <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter by Status
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden lg:table-cell">Avatar</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="hidden lg:table-cell">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${user.username.substring(0,1).toUpperCase()}`} alt={user.username} data-ai-hint="avatar user"/>
                      <AvatarFallback>{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {new Date(user.registrationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="hover:text-primary" title="Edit User">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {user.status === 'active' ? 
                        <Button variant="ghost" size="icon" className="hover:text-yellow-600" title="Deactivate User">
                          <ShieldOff className="h-4 w-4" />
                        </Button> :
                         <Button variant="ghost" size="icon" className="hover:text-green-600" title="Activate User">
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      }
                      <Button variant="ghost" size="icon" className="hover:text-destructive" title="Delete User">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {/* Placeholder for Add/Edit User Dialog */}
    </div>
  );
}
