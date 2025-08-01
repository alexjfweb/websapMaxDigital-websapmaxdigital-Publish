
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFirebaseApp, db } from "@/lib/firebase"; 
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { User, Company, UserRole } from "@/types";
import React from "react";
import { companyService } from "@/services/company-service";

const SUPERADMIN_EMAIL = 'alexjfweb@gmail.com';

const registerFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre es obligatorio." }),
  lastName: z.string().min(2, { message: "El apellido es obligatorio." }),
  businessName: z.string().optional(),
  email: z.string().email({ message: "Por favor, ingrese un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
}).refine(data => {
  if (data.email.toLowerCase() !== SUPERADMIN_EMAIL) {
    return data.businessName && data.businessName.length >= 3;
  }
  return true;
}, {
  message: "El nombre del negocio es obligatorio.",
  path: ["businessName"],
});

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      lastName: "",
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const emailValue = form.watch("email");
  const isSuperAdminFlow = emailValue.toLowerCase() === SUPERADMIN_EMAIL;

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    setIsSubmitting(true);
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      console.log("🔵 Creando usuario en Firebase Auth...");
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;
      console.log("✅ Usuario creado en Auth con UID:", firebaseUser.uid);
      
      const isSuperAdmin = values.email.toLowerCase() === SUPERADMIN_EMAIL;
      const role: UserRole = isSuperAdmin ? 'superadmin' : 'admin';
      
      const username = values.email.split('@')[0];
      const fullName = `${values.name} ${values.lastName}`;

      let companyId: string | undefined = undefined;

      if (role === 'admin' && values.businessName) {
        console.log("🔵 Creando documento de compañía para", values.businessName);
        const newCompanyData = {
            name: values.businessName,
            email: values.email,
            ruc: 'temp-ruc', // RUC temporal, se puede editar después
            location: 'No especificado',
            phone: 'No especificado'
        };
        const userForService = { uid: firebaseUser.uid, email: firebaseUser.email! };
        companyId = await companyService.createCompany(newCompanyData, userForService);
        console.log("✅ Compañía creada con ID:", companyId);
      }

      console.log(`🔵 Creando documento de usuario para ${fullName} con rol ${role}`);
      const newUserForFirestore: User = {
        id: firebaseUser.uid,
        username: username,
        email: firebaseUser.email || values.email,
        role: role,
        name: fullName,
        avatarUrl: `https://placehold.co/100x100.png?text=${values.name.substring(0,1)}${values.lastName.substring(0,1)}`,
        status: 'active',
        registrationDate: new Date().toISOString(),
        companyId: companyId, // Asignar el ID de la compañía aquí
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), newUserForFirestore);
      console.log("✅ Documento de usuario creado en Firestore con companyId:", companyId);
      
      toast({
        title: 'Registro Exitoso',
        description: isSuperAdmin ? `Cuenta de Superadministrador creada.` : `La empresa "${values.businessName}" y su administrador han sido creados.`,
      });

      const redirectPath = isSuperAdmin ? "/superadmin/dashboard" : "/admin/dashboard";
      router.push(redirectPath);

    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error("🔴 Error en el registro:", err);
      let errorMessage = 'Hubo un error al crear la cuenta. Por favor, inténtelo más tarde.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está en uso.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil.';
      }
      
      toast({
        title: 'Error de Registro',
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] bg-gradient-to-br from-background to-accent/10 p-4">
      <Card className="w-full max-w-lg shadow-2xl">
         <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          <CardTitle className="text-3xl font-bold text-primary">Crear Cuenta de Administrador</CardTitle>
          <CardDescription>Registre una nueva cuenta para gestionar su negocio.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Juan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="su@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isSuperAdminFlow && (
                 <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Negocio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Restaurante Sabor Único" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <UserPlus className="mr-2 h-5 w-5" />}
                {isSubmitting ? 'Registrando...' : 'Registrar Cuenta'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
