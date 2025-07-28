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
import { UserPlus } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { app, db } from "@/lib/firebase"; 
import { doc, setDoc } from "firebase/firestore";
import type { User, UserRole } from "@/types";

const registerFormSchema = z.object({
  email: z.string().email({ message: "Por favor, ingrese un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
}).refine(data => data.password, {
  message: "La contraseña es obligatoria",
  path: ["password"],
});

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    try {
      // 1. Asegurar la inicialización correcta obteniendo auth de la app
      const auth = getAuth(app);

      // 2. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;
      const username = values.email.split('@')[0];

      // 3. Preparar datos del usuario para Firestore (rol 'admin' por defecto)
      const newUserForFirestore: User = {
        id: firebaseUser.uid,
        username: username,
        email: firebaseUser.email || values.email,
        role: "admin", // Rol de administrador por defecto
        name: username,
        avatarUrl: `https://placehold.co/100x100.png?text=${username.substring(0,1).toUpperCase()}`,
        status: 'active',
        registrationDate: new Date().toISOString(),
      };

      // 4. Guardar datos en Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), newUserForFirestore);
      
      toast({
        title: 'Registro de Administrador Exitoso',
        description: `El usuario ${values.email} ha sido creado como administrador.`,
      });

      // 5. Redirigir al dashboard de admin
      router.push("/admin/dashboard");

    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error("Error en el registro:", err);
      let errorMessage = 'Hubo un error al crear el usuario. Por favor, inténtelo más tarde.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está en uso.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil.';
      } else if (err.code === 'auth/configuration-not-found'){
        errorMessage = 'Error de configuración de Firebase. Contacta a soporte.';
      }
      
      toast({
        title: 'Error de Registro',
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] bg-gradient-to-br from-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
         <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          <CardTitle className="text-3xl font-bold text-primary">Crear Cuenta de Administrador</CardTitle>
          <CardDescription>Registre una nueva cuenta con permisos de administrador.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico del Administrador</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button type="submit" className="w-full text-lg py-3">
                <UserPlus className="mr-2 h-5 w-5" /> Registrar Administrador
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
