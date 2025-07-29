
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, UploadCloud, Save, Filter, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, UserRole } from "@/types"; 
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDays, isWithinInterval, parseISO } from "date-fns";
import { storageService } from "@/services/storage-service";
import { useSession } from "@/contexts/session-context";
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default function AdminEmployeesPage() {
  const { currentUser } = useSession();
  const companyId = currentUser.companyId;
  const { toast } = useToast();
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async () => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), where("companyId", "==", companyId), where("role", "==", "employee"));
      const querySnapshot = await getDocs(q);
      const fetchedEmployees: User[] = [];
      querySnapshot.forEach((doc) => {
        fetchedEmployees.push({ id: doc.id, ...doc.data() } as User);
      });
      setEmployees(fetchedEmployees);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los empleados.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [companyId]);

  const employeeFormSchema = z.object({
      id: z.string().optional(),
      username: z.string().min(3, { message: 'Se requiere el nombre de usuario' }),
      email: z.string().email({ message: "Por favor, ingrese una dirección de correo electrónico válida." }),
      contact: z.string().optional(),
      role: z.enum(["employee", "admin"], { required_error: "Se requiere el rol." }),
      status: z.enum(["active", "inactive", "pending"], { required_error: "Se requiere el estado." }),
      avatar: z.any().optional(),
  });

  type EmployeeFormData = z.infer<typeof employeeFormSchema>;

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

  const onSubmit = async (values: EmployeeFormData) => {
    if (!companyId) {
      toast({ title: "Error", description: "ID de la compañía no encontrado.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
        let avatarUrl = editingEmployee?.avatarUrl;

        if (values.avatar instanceof File) {
            if (editingEmployee?.avatarUrl && !editingEmployee.avatarUrl.includes('placehold.co')) {
                await storageService.deleteFile(editingEmployee.avatarUrl);
            }
            avatarUrl = await storageService.uploadFile(values.avatar, `avatars/${companyId}/`);
        }

        const employeeData = {
          ...values,
          avatarUrl: avatarUrl || `https://placehold.co/40x40.png?text=${values.username.substring(0,1).toUpperCase()}`,
          companyId: companyId,
          registrationDate: editingEmployee?.registrationDate || new Date().toISOString(),
        };
        delete (employeeData as any).avatar; // remove file object

        if (editingEmployee) {
            const employeeRef = doc(db, "users", editingEmployee.id);
            await updateDoc(employeeRef, employeeData);
            toast({ title: "Empleado Actualizado!", description: `Detalles para ${values.username} han sido actualizados.` });
        } else {
            // Note: This does not create a Firebase Auth user, only a user document in Firestore.
            await addDoc(collection(db, "users"), employeeData);
            toast({ title: "Empleado Agregado!", description: `${values.username} ha sido agregado al equipo.` });
        }
        await fetchEmployees();
        closeDialog();
    } catch (error) {
        console.error("Error saving employee:", error);
        toast({ title: "Error", description: "No se pudo guardar el empleado.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
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

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await deleteDoc(doc(db, "users", employeeId));
      toast({ title: "Empleado Eliminado", description: "El empleado ha sido eliminado del sistema.", variant: "destructive" });
      fetchEmployees();
    } catch (error) {
       toast({ title: "Error", description: "No se pudo eliminar el empleado.", variant: "destructive" });
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    // Filtrar por estado
    if (statusFilter && statusFilter !== 'all' && emp.status !== statusFilter) return false;
    // Filtrar por rango de fechas
    if (dateRange.from && dateRange.to) {
      const regDate = parseISO(emp.registrationDate);
      if (!isWithinInterval(regDate, { start: dateRange.from, end: addDays(dateRange.to, 1) })) return false;
    }
    // Filtrar por búsqueda
    if (search && !(
      emp.username.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.contact && emp.contact.includes(search))
    )) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestión de empleados</h1>
          <p className="text-lg text-muted-foreground">Descripción de la página de empleados</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
             <DialogHeader>
                <DialogTitle>{editingEmployee ? 'Editar Empleado' : 'Agregar Empleado'}</DialogTitle>
                <DialogDescription>
                  {editingEmployee ? 'Descripción de la edición' : 'Descripción de la creación'}
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <div className="space-y-2">
                    <FormLabel>Avatar</FormLabel>
                    <div className="flex items-center gap-4">
                       <Avatar className="h-20 w-20">
                            <AvatarImage src={avatarPreview || `https://placehold.co/80x80.png?text=??`} alt="Avatar Preview" data-ai-hint="user avatar"/>
                            <AvatarFallback>{form.getValues("username")?.substring(0, 2).toUpperCase() || 'AV'}</AvatarFallback>
                        </Avatar>
                        <div className="relative">
                            <Button type="button" variant="outline" asChild>
                                <label htmlFor="avatar-upload" className="cursor-pointer">
                                    <UploadCloud className="mr-2 h-4 w-4"/> Cambiar Avatar
                                </label>
                            </Button>
                           <Input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange}/>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="username" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de Usuario</FormLabel>
                        <FormControl><Input placeholder="Nombre de usuario" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl><Input type="email" placeholder="Correo electrónico" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField control={form.control} name="contact" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contacto</FormLabel>
                        <FormControl><Input type="tel" placeholder="Contacto" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rol</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="employee">Empleado</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="inactive">Inactivo</SelectItem>
                                    <SelectItem value="pending">Pendiente</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                 </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : <><Save className="mr-2 h-4 w-4"/> {editingEmployee ? 'Guardar Cambios' : 'Crear'}</>}
                    </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Empleados</CardTitle>
          <CardDescription>Descripción de la sección de empleados</CardDescription>
          <div className="flex flex-col gap-2 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full gap-2 items-center">
              <div className="relative flex-grow min-w-[12rem] md:min-w-[20rem] lg:min-w-[28rem]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar empleados"
                  className="pl-10 pr-4 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 transition-all w-full"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-auto">
                <Button
                  variant="outline"
                  asChild
                  className={`flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-background border border-border shadow-sm hover:shadow-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 ${statusFilter && statusFilter !== 'all' ? 'ring-2 ring-primary/40 bg-primary/10 text-primary' : ''}`}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="flex items-center w-full bg-background border border-border shadow-sm hover:shadow-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 px-4 py-2 rounded-md font-medium"
                      tabIndex={0}
                    >
                      <Filter className="mr-2 h-4 w-4" /> Filtrar por Estado
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setStatusFilter('all')}>Todos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('active')}>Activo</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>Inactivo</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-background border border-border shadow-sm hover:shadow-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 ${dateRange.from && dateRange.to ? 'ring-2 ring-primary/40 bg-primary/10 text-primary' : ''}`}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" /> Filtrar por Fecha
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-0">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      initialFocus
                    />
                    <div className="flex justify-end p-2">
                      <Button size="sm" variant="ghost" onClick={() => setDateRange({ from: null, to: null })}>Limpiar Filtro de Fecha</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Avatar</TableHead>
                <TableHead>Nombre de Usuario</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead className="hidden sm:table-cell">Contacto</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="hidden md:table-cell">
                    <Avatar>
                      <AvatarImage src={employee.avatarUrl || `https://placehold.co/40x40.png?text=${employee.username.substring(0,1).toUpperCase()}`} alt={employee.username} data-ai-hint="avatar user" />
                      <AvatarFallback>{employee.username.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{employee.username}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">{employee.contact || 'No disponible'}</TableCell>
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
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta acción eliminará permanentemente el empleado &quot;{employee.username}&quot;. Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)} className="bg-destructive hover:bg-destructive/90">
                                      Sí, eliminar empleado
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

