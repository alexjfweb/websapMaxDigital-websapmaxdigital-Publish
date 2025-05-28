
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types"; 
import { useLanguage } from "@/contexts/language-context";

// Mock Data for Employees
const mockEmployees: User[] = [
  { id: "emp-1", username: "john.chef", email: "john.chef@websapmax.com", contact: "555-1111", role: "employee", status: "active", registrationDate: "2023-01-15", avatarUrl: "https://placehold.co/40x40.png?text=JC" },
  { id: "emp-2", username: "sara.waitress", email: "sara.waitress@websapmax.com", contact: "555-2222", role: "employee", status: "active", registrationDate: "2023-03-20", avatarUrl: "https://placehold.co/40x40.png?text=SW" },
  { id: "emp-3", username: "mike.delivery", email: "mike.delivery@websapmax.com", contact: "555-3333", role: "employee", status: "inactive", registrationDate: "2023-05-10", avatarUrl: "https://placehold.co/40x40.png?text=MD" },
];


export default function AdminEmployeesPage() {
  const { t } = useLanguage();
  const employees = mockEmployees;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('adminEmployees.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('adminEmployees.description')}</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> {t('adminEmployees.addNewButton')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminEmployees.allEmployeesCard.title')}</CardTitle>
          <CardDescription>{t('adminEmployees.allEmployeesCard.description')}</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('adminEmployees.searchInputPlaceholder')} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">{t('adminEmployees.table.avatar')}</TableHead>
                <TableHead>{t('adminEmployees.table.username')}</TableHead>
                <TableHead>{t('adminEmployees.table.email')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('adminEmployees.table.contact')}</TableHead>
                <TableHead className="text-center">{t('adminEmployees.table.status')}</TableHead>
                <TableHead className="text-right">{t('adminEmployees.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="hidden md:table-cell">
                    <Avatar>
                      <AvatarImage src={employee.avatarUrl || `https://placehold.co/40x40.png?text=${employee.username.substring(0,1).toUpperCase()}`} alt={employee.username} data-ai-hint="avatar user" />
                      <AvatarFallback>{employee.username.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{employee.username}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">{employee.contact || t('adminEmployees.contact.notAvailable')}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={employee.status === 'active' ? 'default' : 'outline'} 
                           className={employee.status === 'active' ? 'bg-green-500 text-white' : 'border-yellow-500 text-yellow-600'}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="hover:text-primary">
                        <UserCog className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" className="hover:text-primary">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
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
    </div>
  );
}
