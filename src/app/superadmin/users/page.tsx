
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Filter, UserCog, ShieldCheck, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, UserRole } from "@/types"; 
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link"; // Importado Link
import { format } from "date-fns";

// Mock Data for Users
const mockUsers: User[] = [
  { id: "usr-sa1", username: "super.admin", email: "sa@websapmax.com", role: "superadmin", status: "active", registrationDate: "2022-01-01", avatarUrl: "https://placehold.co/40x40.png?text=SA" },
  { id: "usr-ad1", username: "restaurant.owner", email: "owner@example.com", role: "admin", status: "active", registrationDate: "2023-02-10", avatarUrl: "https://placehold.co/40x40.png?text=RO" },
  { id: "usr-em1", username: "chef.john", email: "chef.john@example.com", role: "employee", status: "active", registrationDate: "2023-03-15", contact: "555-1234" },
  { id: "usr-ad2", username: "another.admin", email: "admin2@example.com", role: "admin", status: "pending", registrationDate: "2024-01-20" },
  { id: "usr-em2", username: "waiter.jane", email: "waiter.jane@example.com", role: "employee", status: "inactive", registrationDate: "2023-04-01", contact: "555-5678" },
];

export default function SuperAdminUsersPage() {
  const { t } = useLanguage();
  const users = mockUsers;

  const getRoleBadge = (role: UserRole) => {
    const roleKey = `superAdminUsers.role.${role}`;
    const roleText = t(roleKey);
    switch (role) {
      case "superadmin": return <Badge className="bg-red-600 text-white hover:bg-red-700"><ShieldCheck className="mr-1 h-3 w-3"/>{roleText}</Badge>;
      case "admin": return <Badge className="bg-blue-600 text-white hover:bg-blue-700"><UserCog className="mr-1 h-3 w-3"/>{roleText}</Badge>;
      case "employee": return <Badge className="bg-green-600 text-white hover:bg-green-700">{roleText}</Badge>;
      default: return <Badge variant="outline">{roleText}</Badge>;
    }
  };

  const getStatusBadge = (status: User["status"]) => {
    const statusKey = `superAdminUsers.status.${status}`; // Asegúrate que las claves existen en translations.ts
    const statusText = t(statusKey);
    switch (status) {
      case "active": return <Badge variant="default" className="bg-green-500 text-white">{statusText}</Badge>;
      case "inactive": return <Badge variant="outline" className="text-gray-500 border-gray-400">{statusText}</Badge>;
      case "pending": return <Badge variant="secondary" className="bg-yellow-500 text-white">{statusText}</Badge>; // Usando amarillo para pendiente
      default: return <Badge variant="outline">{statusText}</Badge>;
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('superAdminUsers.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('superAdminUsers.description')}</p>
        </div>
        <Link href="/superadmin/users/create" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> {t('superAdminUsers.createUserButton')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('superAdminUsers.allUsersCard.title')}</CardTitle>
          <CardDescription>{t('superAdminUsers.allUsersCard.description')}</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('superAdminUsers.searchInputPlaceholder')} className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> {t('superAdminUsers.filterByRoleButton')}
            </Button>
             <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> {t('superAdminUsers.filterByStatusButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden lg:table-cell">{t('superAdminUsers.table.avatar')}</TableHead>
                <TableHead>{t('superAdminUsers.table.username')}</TableHead>
                <TableHead>{t('superAdminUsers.table.email')}</TableHead>
                <TableHead className="text-center">{t('superAdminUsers.table.role')}</TableHead>
                <TableHead className="text-center">{t('superAdminUsers.table.status')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('superAdminUsers.table.registered')}</TableHead>
                <TableHead className="text-right">{t('superAdminUsers.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="hidden lg:table-cell">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${user.username.substring(0,1).toUpperCase()}`} alt={user.username} data-ai-hint="user avatar"/>
                      <AvatarFallback>{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {format(new Date(user.registrationDate), "P")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="hover:text-primary" title={t('superAdminUsers.actions.editUser')}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {user.status === 'active' ? 
                        <Button variant="ghost" size="icon" className="hover:text-yellow-600" title={t('superAdminUsers.actions.deactivateUser')}>
                          <ShieldOff className="h-4 w-4" />
                        </Button> :
                         <Button variant="ghost" size="icon" className="hover:text-green-600" title={t('superAdminUsers.actions.activateUser')}>
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      }
                      <Button variant="ghost" size="icon" className="hover:text-destructive" title={t('superAdminUsers.actions.deleteUser')}>
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

    
