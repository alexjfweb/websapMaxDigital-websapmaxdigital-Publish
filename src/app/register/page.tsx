
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
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, getAuth, User as FirebaseUser } from "firebase/auth";
import { getFirebaseApp, db } from "@/lib/firebase"; 
import { doc, setDoc } from "firebase/firestore";
import type { UserRole, User, Company } from "@/types";
import React, { Suspense, useState } from "react";
import { companyService } from "@/services/company-service";
import ErrorModal from "@/components/ui/error-modal";

const SUPERADMIN_EMAIL = 'alexjfweb@gmail.com';

const registerFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre es obligatorio." }),
  lastName: z.string().min(2, { message: "El apellido es obligatorio." }),
  businessName: z.string().optional(),
  ruc: z.string().optional(),
  email: z.string().email({ message: "Por favor, ingrese un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
}).refine(data => {
  if (data.email.toLowerCase() !== SUPERADMIN_EMAIL) {
    return data.businessName && data.businessName.trim().length >= 3 && data.ruc && data.ruc.trim().length >= 3;
  }
  return true;
}, {
  message: "El nombre de la empresa y el RUC son obligatorios.",
  path: ["businessName"],
});

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState<{ title: string; message: string } | null>(null);

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      lastName: "",
      businessName: "",
      ruc: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const emailValue = form.watch("email");
  const isSuperAdminFlow = emailValue.toLowerCase() === SUPERADMIN_EMAIL;

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    setIsSubmitting(true);
    setErrorState(null);
    let firebaseUser: FirebaseUser | undefined;
    
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      firebaseUser = userCredential.user;
      
      const isSuperAdmin = values.email.toLowerCase() === SUPERADMIN_EMAIL;
      const role: UserRole = isSuperAdmin ? 'superadmin' : 'admin';
      let companyId: string | undefined = undefined;

      if (role === 'admin') {
        if (!values.businessName || !values.ruc) {
            throw new Error("El nombre de la empresa y el RUC son necesarios para el registro de administradores.");
        }
        
        const companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
            name: values.businessName,
            email: values.email,
            ruc: values.ruc,
            status: 'active',
            registrationDate: new Date().toISOString(),
            planId: planId || 'plan-gratuito',
            subscriptionStatus: planId ? 'pending_payment' : 'trialing',
            location: '',
        };
        
        console.log("Intentando crear compañía con datos:", companyData);
        const createdCompany = await companyService.createCompany(companyData, { uid: firebaseUser.uid, email: firebaseUser.email! });
        companyId = createdCompany.id;
        console.log("Compañía creada con ID:", companyId);
      }

      const userData: Omit<User, 'id'> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || values.email,
        username: values.email.split('@')[0],
        firstName: values.name,
        lastName: values.lastName,
        role: role,
        companyId: companyId,
        businessName: values.businessName || '',
        status: 'active',
        registrationDate: new Date().toISOString(),
        isActive: true,
        avatarUrl: `https://placehold.co/100x100.png?text=${values.name.charAt(0)}`,
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      
      toast({
        title: '¡Registro Exitoso!',
        description: isSuperAdmin ? 'Cuenta de Superadministrador creada.' : `La empresa "${values.businessName}" y su administrador han sido creados. Serás redirigido para iniciar sesión.`,
      });

      router.push('/login');

    } catch (error) {
      const err = error as { code?: string; message?: string };
      let errorMessage = err.message || 'Hubo un error al crear la cuenta.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "El correo electrónico que ingresaste ya está asociado con otra cuenta. Por favor, intenta con otro correo o inicia sesión si ya tienes una cuenta.";
      }
      
      setErrorState({
            title: "Error de Registro",
            message: errorMessage,
      });
      
      if (firebaseUser) {
        try {
          await firebaseUser.delete();
          console.log("Usuario de Auth revertido exitosamente debido a un error en el flujo de registro.");
        } catch (rollbackError) {
          console.error("Falló el rollback del usuario de Auth:", rollbackError);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
    <ErrorModal
        isOpen={!!errorState}
        title={errorState?.title || ""}
        message={errorState?.message || ""}
        onClose={() => setErrorState(null)}
    />
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/10 p-4">
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
                 <>
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
                    <FormField
                      control={form.control}
                      name="ruc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RUC / ID Fiscal</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 123456789-0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </>
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
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
