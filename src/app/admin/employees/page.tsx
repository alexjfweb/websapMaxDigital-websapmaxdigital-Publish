"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, UploadCloud, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, UserRole } from "@/types"; 
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


// Mock Data for Employees
const mockEmployees: User[] = [
  { id: "emp-1", username: "john.chef", email: "john.chef@websapmax.com", contact: "555-1111", role: "employee", status: "active", registrationDate: "2023-01-15", avatarUrl: "https://placehold.co/40x40.png?text=JC" },
  { id: "emp-2", username: "sara.waitress", email: "sara.waitress@websapmax.com", contact: "555-2222", role: "employee", status: "active", registrationDate: "2023-03-20", avatarUrl: "https://placehold.co/40x40.png?text=SW" },
  { id: "emp-3", username: "mike.delivery", email: "mike.delivery@websapmax.com", contact: "555-3333", role: "employee", status: "inactive", registrationDate: "2023-05-10", avatarUrl: "https://placehold.co/40x40.png?text=MD" },
];


export default function AdminEmployeesPage() {
  const { t } = useTranslation();
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Language | null;
    if (storedLang && translations[storedLang]) {
      setLang(storedLang);
    }
  }, []);

  const employeeFormSchema = z.object({
      id: z.string().optional(),
      username: z.string().min(3, { message: t('adminDishes.validation.usernameRequired') }),
      email: z.string().email({ message: "Please enter a valid email." }),
      contact: z.string().optional(),
      role: z.enum(["employee", "admin"], { required_error: "Role is required." }),
      status: z.enum(["active", "inactive", "pending"], { required_error: "Status is required." }),
      avatar: z.any().optional(),
  });

  type EmployeeFormData = z.infer<typeof employeeFormSchema>;

  const { toast } = useToast();
  const [employees, setEmployees] = useState<User[]>(mockEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      username: "",
      email: "",
      contact: "",
      role: "employee",
      status: "active",
      avatar: null
    },
  });

  useEffect(() => {
    if (editingEmployee) {
      form.reset({
        id: editingEmployee.id,
        username: editingEmployee.username,
        email: editingEmployee.email,
        contact: editingEmployee.contact || "",
        role: editingEmployee.role as "employee" | "admin",
        status: editingEmployee.status,
      });
      setAvatarPreview(editingEmployee.avatarUrl || null);
    } else {
      form.reset({
        username: "",
        email: "",
        contact: "",
        role: "employee",
        status: "active",
        avatar: null
      });
      setAvatarPreview(null);
    }
  }, [editingEmployee, form, isDialogOpen]);
  
  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        form.setValue("avatar", file);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
      form.setValue("avatar", null);
    }
  };

  const onSubmit = (values: EmployeeFormData) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id ? { 
            ...emp, 
            ...values,
            role: values.role as UserRole,
            avatarUrl: avatarPreview || emp.avatarUrl 
        } : emp
      ));
      toast({ title: "Employee Updated!", description: `Details for ${values.username} have been updated.` });
    } else {
      const newEmployee: User = {
        id: `emp-${Date.now()}`,
        username: values.username,
        email: values.email,
        contact: values.contact,
        role: values.role as UserRole,
        status: values.status,
        registrationDate: new Date().toISOString(),
        avatarUrl: avatarPreview || `https://placehold.co/40x40.png?text=${values.username.substring(0,1).toUpperCase()}`,
      };
      setEmployees(prev => [newEmployee, ...prev]);
      toast({ title: "Employee Added!", description: `${values.username} has been added to the team.` });
    }
    closeDialog();
  };
  
  const openEditDialog = (employee: User) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingEmployee(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  }

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    toast({ title: "Employee Deleted", description: "The employee has been removed from the system.", variant: "destructive" });
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('adminEmployees.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('adminEmployees.description')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <PlusCircle className="mr-2 h-5 w-5" /> {t('adminEmployees.addNewButton')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
             <DialogHeader>
                <DialogTitle>{editingEmployee ? t('adminEmployees.dialog.editTitle') : t('adminEmployees.dialog.addTitle')}</DialogTitle>
                <DialogDescription>
                  {editingEmployee ? t('adminEmployees.dialog.editDescription') : t('adminEmployees.dialog.addDescription')}
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <div className="space-y-2">
                    <FormLabel>{t('adminEmployees.form.avatarLabel')}</FormLabel>
                    <div className="flex items-center gap-4">
                       <Avatar className="h-20 w-20">
                            <AvatarImage src={avatarPreview || `https://placehold.co/80x80.png?text=??`} alt="Avatar Preview" data-ai-hint="user avatar"/>
                            <AvatarFallback>{form.getValues("username")?.substring(0, 2).toUpperCase() || 'AV'}</AvatarFallback>
                        </Avatar>
                        <div className="relative">
                            <Button type="button" variant="outline" asChild>
                                <label htmlFor="avatar-upload" className="cursor-pointer">
                                    <UploadCloud className="mr-2 h-4 w-4"/> {t('adminEmployees.form.changeAvatarButton')}
                                </label>
                            </Button>
                           <Input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange}/>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="username" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('adminEmployees.form.usernameLabel')}</FormLabel>
                        <FormControl><Input placeholder={t('adminEmployees.form.usernamePlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('adminEmployees.form.emailLabel')}</FormLabel>
                        <FormControl><Input type="email" placeholder={t('adminEmployees.form.emailPlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField control={form.control} name="contact" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('adminEmployees.form.contactLabel')}</FormLabel>
                        <FormControl><Input type="tel" placeholder={t('adminEmployees.form.contactPlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('adminEmployees.form.roleLabel')}</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="employee">Employee</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('adminEmployees.form.statusLabel')}</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                 </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>{t('adminEmployees.form.cancelButton')}</Button>
                    <Button type="submit"><Save className="mr-2 h-4 w-4"/> {editingEmployee ? t('adminEmployees.form.saveChangesButton') : t('adminEmployees.form.createButton')}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                       <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => openEditDialog(employee)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This will permanently delete the employee "{employee.username}". This action cannot be undone.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)} className="bg-destructive hover:bg-destructive/90">
                                      Yes, delete employee
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
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
