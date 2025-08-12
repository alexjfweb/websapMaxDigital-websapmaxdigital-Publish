
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Filter, UserCog, ShieldCheck, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, UserRole } from "@/types"; 
import Link from "next/link";
import { format } from "date-fns";
import React, { useState, useEffect, useMemo } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/hooks/use-users"; // Importar el nuevo hook

export default function SuperAdminUsersPage() {
  const { users, isLoading, error } = useUsers(); // Usar el hook para obtener datos reales
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate'>('activate');
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const roleOptions = [
    { value: "all", label: "Todos los roles" },
    { value: "superadmin", label: "Superadmin" },
    { value: "admin", label: "Admin" },
    { value: "employee", label: "Empleado" },
  ];
  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
    { value: "pending", label: "Pendiente" },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      (selectedRole === "all" || user.role === selectedRole) &&
      (selectedStatus === "all" || user.status === selectedStatus)
    );
  }, [users, selectedRole, selectedStatus]);


  const getRoleBadge = (role: UserRole) => {
    const roleTranslations: { [key in UserRole]: string } = {
      superadmin: "Superadmin",
      admin: "Admin", 
      employee: "Empleado",
      guest: "Invitado"
    };
    
    const roleText = roleTranslations[role] || role;
    
    switch (role) {
      case "superadmin": 
        return <Badge className="bg-red-600 text-white hover:bg-red-700"><ShieldCheck className="mr-1 h-3 w-3"/>{roleText}</Badge>;
      case "admin": 
        return <Badge className="bg-blue-600 text-white hover:bg-blue-700"><UserCog className="mr-1 h-3 w-3"/>{roleText}</Badge>;
      case "employee": 
        return <Badge className="bg-green-600 text-white hover:bg-green-700">{roleText}</Badge>;
      default: 
        return <Badge variant="outline">{roleText}</Badge>;
    }
  };

  const getStatusBadge = (status: User["status"]) => {
    const statusTranslations: { [key in User['status']]: string } = {
      active: "Activo",
      inactive: "Inactivo", 
      pending: "Pendiente"
    };
    
    const statusText = statusTranslations[status] || status;
    
    switch (status) {
      case "active": 
        return <Badge variant="default" className="bg-green-500 text-white">{statusText}</Badge>;
      case "inactive": 
        return <Badge variant="outline" className="text-gray-500 border-gray-400">{statusText}</Badge>;
      case "pending": 
        return <Badge variant="secondary" className="bg-yellow-500 text-white">{statusText}</Badge>;
      default: 
        return <Badge variant="outline">{statusText}</Badge>;
    }
  };

  const handleOpenDetail = (user: User) => { setSelectedUser(user); setOpenDetail(true); };
  const handleOpenStatus = (user: User, action: 'activate' | 'deactivate') => { setSelectedUser(user); setStatusAction(action); setOpenStatus(true); };
  const handleOpenDelete = (user: User) => { setSelectedUser(user); setOpenDelete(true); };
  const handleCloseModals = () => { setOpenDetail(false); setOpenStatus(false); setOpenDelete(false); setSelectedUser(null); };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
            <div className="flex flex-col md:flex-row gap-2 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-36" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 6 }).map((_, i) => <TableHead key={i}><Skeleton className="h-4 w-full" /></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
      return <div>Error al cargar los usuarios: {error.message}</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Usuarios</h1>
          <p className="text-lg text-muted-foreground">Descripción de la página de usuarios</p>
        </div>
        <Link href="/superadmin/users/create" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Crear Usuario
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Usuarios</CardTitle>
          <CardDescription>Descripción de la sección de todos los usuarios</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar usuario..." className="pl-8" />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden lg:table-cell">Avatar</TableHead>
                <TableHead>Nombre de usuario</TableHead>
                <TableHead>Correo electrónico</TableHead>
                <TableHead className="text-center">Rol</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="hidden sm:table-cell">Registrado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="hidden lg:table-cell">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${user.username.substring(0,1).toUpperCase()}`} alt={user.username} data-ai-hint="user avatar" />
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:text-primary" title="Acciones">
                            <span className="sr-only">Acciones</span>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleOpenDetail(user)}>
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push(`/superadmin/users/create?edit=${user.id}`)}>
                            Editar Usuario
                          </DropdownMenuItem>
                          {user.status === 'active' ? (
                            <DropdownMenuItem onSelect={() => handleOpenStatus(user, 'deactivate')}>
                              Desactivar Usuario
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => handleOpenStatus(user, 'activate')}>
                              Activar Usuario
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onSelect={() => handleOpenDelete(user)} className="text-destructive">
                            Eliminar Usuario
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {/* Modales de acciones */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ver detalles</DialogTitle>
            <DialogDescription>{selectedUser?.username}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-2 text-base">
              <div className="flex items-center gap-3 mb-2">
                <Avatar>
                  <AvatarImage src={selectedUser.avatarUrl || `https://placehold.co/40x40.png?text=${selectedUser.username.substring(0,1).toUpperCase()}`} alt={selectedUser.username} />
                  <AvatarFallback>{selectedUser.username.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-bold text-lg">{selectedUser.name || selectedUser.username}</span>
              </div>
              <div><b>Nombre de usuario:</b> {selectedUser.username}</div>
              <div><b>Correo electrónico:</b> {selectedUser.email}</div>
              <div><b>Rol:</b> {getRoleBadge(selectedUser.role)}</div>
              <div><b>Estado:</b> {getStatusBadge(selectedUser.status)}</div>
              <div><b>Registrado:</b> {format(new Date(selectedUser.registrationDate), "P")}</div>
              {selectedUser.contact && <div><b>Contacto:</b> {selectedUser.contact}</div>}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseModals}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openStatus} onOpenChange={setOpenStatus}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {statusAction === 'activate'
                ? 'Activar Usuario'
                : 'Desactivar Usuario'}
            </DialogTitle>
            <DialogDescription>
              {statusAction === 'activate'
                ? '¿Seguro que deseas activar este usuario?'
                : '¿Seguro que deseas desactivar este usuario?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleCloseModals}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>¿Seguro que deseas eliminar este usuario?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleCloseModals} variant="destructive">Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
