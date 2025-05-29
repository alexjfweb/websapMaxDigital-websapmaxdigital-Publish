
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription as ShadCNCardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Importar auth de tu configuración de Firebase
import type { User, UserRole } from "@/types";
import { useLanguage } from "@/contexts/language-context";


const registerFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  role: z.enum(["admin", "employee"], { required_error: "Please select a role." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      // role: "employee", // Default role or leave empty
    },
  });

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;

      // Crear objeto de usuario para localStorage
      const newUser: User = {
        id: firebaseUser.uid,
        username: values.username,
        email: firebaseUser.email || values.email,
        role: values.role as UserRole, // El schema ya valida que sea 'admin' o 'employee'
        name: values.username, // Usar username como name por simplicidad
        avatarUrl: `https://placehold.co/100x100.png?text=${values.username.substring(0,1).toUpperCase()}`,
        status: 'active',
        registrationDate: new Date().toISOString(),
      };

      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      toast({
        title: t('registerPage.toast.successTitle'),
        description: t('registerPage.toast.successDescription', { email: values.email }),
      });

      // Redirigir según el rol
      if (values.role === "admin") {
        router.push("/admin/dashboard");
      } else if (values.role === "employee") {
        router.push("/employee/dashboard");
      } else {
        router.push("/"); // Fallback, aunque el schema debería prevenir esto
      }

    } catch (error: any) {
      console.error("Firebase registration error:", error);
      let errorMessage = t('registerPage.toast.errorDefaultDescription');
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('registerPage.toast.errorEmailInUse');
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t('registerPage.toast.errorWeakPassword');
      }
      toast({
        title: t('registerPage.toast.errorTitle'),
        description: errorMessage,
        variant: "destructive",
      });
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
          <CardTitle className="text-3xl font-bold text-primary" suppressHydrationWarning>{t('registerPage.title')}</CardTitle>
          <ShadCNCardDescription suppressHydrationWarning>{t('registerPage.description')}</ShadCNCardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('registerPage.usernameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('registerPage.usernamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('registerPage.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('registerPage.emailPlaceholder')} {...field} />
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
                    <FormLabel>{t('registerPage.passwordLabel')}</FormLabel>
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
                    <FormLabel>{t('registerPage.confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('registerPage.roleLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('registerPage.rolePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">{t('registerPage.roleAdmin')}</SelectItem>
                        <SelectItem value="employee">{t('registerPage.roleEmployee')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t('registerPage.roleDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-3">
                <UserPlus className="mr-2 h-5 w-5" /> {t('registerPage.signUpButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t('registerPage.alreadyHaveAccount')}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t('registerPage.loginLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
