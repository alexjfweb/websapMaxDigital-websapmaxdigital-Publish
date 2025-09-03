
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
import { UserPlus, Loader2, Check, X } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { User as FirebaseUser, deleteUser } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Usar la instancia centralizada
import type { User, UserRole, Company } from "@/types";
import React, { Suspense, useState, useEffect } from "react";
import { companyService } from "@/services/company-service";
import ErrorModal from "@/components/ui/error-modal";
import PublicHeader from "@/components/layout/public-header";

const SUPERADMIN_EMAIL = 'alexjfweb@gmail.com';

const registerFormSchema = z.object({
  firstName: z.string().min(2, { message: "El nombre es obligatorio." }),
  lastName: z.string().min(2, { message: "El apellido es obligatorio." }),
  businessName: z.string().optional(),
  ruc: z.string().optional(),
  email: z.string().email({ message: "Por favor, ingrese un correo electrónico válido." }),
  password: z.string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
    .regex(/[a-z]/, { message: "Debe contener al menos una minúscula." })
    .regex(/[A-Z]/, { message: "Debe contener al menos una mayúscula." })
    .regex(/[0-9]/, { message: "Debe contener al menos un número." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
}).refine(data => {
  if (data.email.toLowerCase() !== SUPERADMIN_EMAIL) {
    return data.businessName && data.businessName.trim().length >= 3 && data.ruc && data.ruc.trim().length >= 8;
  }
  return true;
}, {
  message: "El nombre de la empresa y un RUC válido son obligatorios.",
  path: ["businessName"],
});

const PasswordValidationIndicator = ({ password }: { password?: string }) => {
    if (!password) return null;
    const checks = [
        { label: "8+ caracteres", valid: (password?.length ?? 0) >= 8 },
        { label: "Mayúscula", valid: /[A-Z]/.test(password) },
        { label: "Minúscula", valid: /[a-z]/.test(password) },
        { label: "Número", valid: /[0-9]/.test(password) },
    ];
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
            {checks.map(c => (
                <div key={c.label} className={`flex items-center gap-1.5 ${c.valid ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {c.valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3"/>}
                    <span>{c.label}</span>
                </div>
            ))}
        </div>
    );
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planSlug = searchParams.get('plan');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState<{ title: string; message: string } | null>(null);

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "", lastName: "", businessName: "", ruc: "", email: "", password: "", confirmPassword: "",
    },
  });

  const emailValue = form.watch("email");
  const passwordValue = form.watch("password");
  const isSuperAdminFlow = emailValue.toLowerCase() === SUPERADMIN_EMAIL;

  useEffect(() => {
    if (isSuperAdminFlow) {
        form.setValue("businessName", "");
        form.setValue("ruc", "");
    }
  }, [isSuperAdminFlow, form]);

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    setIsSubmitting(true);
    setErrorState(null);
    let firebaseUser: FirebaseUser | null = null;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      firebaseUser = userCredential.user;

      const role: UserRole = isSuperAdminFlow ? 'superadmin' : 'admin';
      
      const adminUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          firstName: values.firstName,
          lastName: values.lastName,
          role: role,
      };

      if (role === 'admin') {
        if (!values.businessName || !values.ruc) {
            throw new Error("El nombre de la empresa y el RUC son necesarios para administradores.");
        }
        
        const companyData = {
            name: values.businessName,
            email: values.email,
            ruc: values.ruc,
            planId: planSlug || 'plan-gratuito', // Asigna el plan o uno gratuito por defecto
        };

        // Usar el nuevo método atómico del servicio
        await companyService.createCompanyWithAdminUser(companyData, adminUserData);

      } else { // Si es SuperAdmin
         // Solo crea el documento del usuario, ya que no hay compañía.
         // En una implementación real, se podría reutilizar una función 'createUserDocument'
         await companyService.createCompanyWithAdminUser({} as any, adminUserData, true);
      }
      
      toast({ title: '¡Registro Exitoso!', description: `Serás redirigido para continuar.` });

      // La redirección la maneja el SessionProvider, pero si se elige un plan, se va a checkout
      if (planSlug) {
          router.push(`/admin/checkout?plan=${planSlug}`);
      } else {
          router.push('/login'); // O al dashboard si el SessionProvider ya lo maneja
      }

    } catch (error) {
      console.error("Error detallado en el registro:", error);
      
      // Si la creación del usuario en Auth fue exitosa pero el resto falló, se revierte.
      if (firebaseUser) {
        try { await deleteUser(firebaseUser); console.log("↩️ Usuario de Auth revertido exitosamente."); } 
        catch (revertError) { console.error("🔴 Error CRÍTICO al revertir la creación del usuario de Auth:", revertError); }
      }

      const err = error as { code?: string; message?: string };
      let errorMessage = err.message || 'Hubo un error al crear la cuenta.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "El correo electrónico que ingresaste ya está en uso.";
      }
      
      setErrorState({ title: "Error de Registro", message: errorMessage });
      
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
    <PublicHeader />
    <ErrorModal isOpen={!!errorState} title={errorState?.title || ""} message={errorState?.message || ""} onClose={() => setErrorState(null)} />
    <div className="flex items-center justify-center min-h-screen pt-20 bg-gradient-to-br from-background to-accent/10 p-4">
      <Card className="w-full max-w-lg shadow-2xl">
         <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Crear Cuenta</CardTitle>
          <CardDescription>Crea una nueva cuenta para gestionar tu negocio.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Ej. Juan" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Apellido</FormLabel><FormControl><Input placeholder="Ej. Pérez" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" placeholder="su@correo.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              {!isSuperAdminFlow && (
                 <>
                  <FormField control={form.control} name="businessName" render={({ field }) => (<FormItem><FormLabel>Nombre del Negocio</FormLabel><FormControl><Input placeholder="Ej. Restaurante Sabor Único" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="ruc" render={({ field }) => (<FormItem><FormLabel>RUC / ID Fiscal</FormLabel><FormControl><Input placeholder="Ej. 123456789-0" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 </>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><PasswordValidationIndicator password={passwordValue} /><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirmar Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <UserPlus className="mr-2 h-5 w-5" />}{isSubmitting ? 'Registrando...' : 'Registrar Cuenta'}</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">¿Ya tienes una cuenta? <Link href="/login" className="font-medium text-primary hover:underline">Iniciar sesión</Link></p>
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
