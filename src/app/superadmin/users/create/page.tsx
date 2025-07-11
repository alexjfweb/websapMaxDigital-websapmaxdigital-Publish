
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { UserPlus, ArrowLeft, Save } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // Importar db
import { doc, setDoc } from "firebase/firestore"; // Importar doc y setDoc
import type { User, UserRole } from "@/types";
import { useLanguage } from "@/contexts/language-context";

const createUserFormSchema = z.object({
  username: z.string().min(3, { message: "superAdminUsersCreate.validation.usernameRequired" }),
  email: z.string().email({ message: "superAdminUsersCreate.validation.emailInvalid" }),
  password: z.string().min(6, { message: "superAdminUsersCreate.validation.passwordMinLength" }),
  confirmPassword: z.string(),
  role: z.enum(["admin", "employee"], { required_error: "superAdminUsersCreate.validation.roleRequired" }),
  name: z.string().optional(),
  contact: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "superAdminUsersCreate.validation.passwordsNoMatch",
  path: ["confirmPassword"],
});

export default function SuperAdminCreateUserPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const form = useForm<z.infer<typeof createUserFormSchema>>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      contact: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createUserFormSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        username: values.username,
        email: firebaseUser.email || values.email,
        role: values.role as UserRole,
        name: values.name || values.username,
        contact: values.contact,
        avatarUrl: `https://placehold.co/100x100.png?text=${values.username.substring(0,1).toUpperCase()}`,
        status: 'active',
        registrationDate: new Date().toISOString(),
      };

      // Guardar detalles del usuario en Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      
      toast({
        title: t('superAdminUsersCreate.toast.successTitle'),
        description: t('superAdminUsersCreate.toast.successDescription', { username: values.username }),
      });

      router.push("/superadmin/users");

    } catch (error: any) {
      console.error("Firebase user creation error:", error);
      let errorMessage = t('superAdminUsersCreate.toast.errorDefaultDescription');
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('superAdminUsersCreate.toast.errorEmailInUse');
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t('superAdminUsersCreate.toast.errorWeakPassword');
      } else if (error.message.includes("Firestore")) {
        errorMessage = t('superAdminUsersCreate.toast.errorFirestore');
      }
      toast({
        title: t('superAdminUsersCreate.toast.errorTitle'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/superadmin/users" passHref>
          <Button variant="outline" size="icon" aria-label={t('superAdminUsersCreate.backButtonAriaLabel')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-primary">{t('superAdminUsersCreate.title')}</h1>
            <p className="text-lg text-muted-foreground">{t('superAdminUsersCreate.description')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('superAdminUsersCreate.formTitle')}</CardTitle>
          <CardDescription>{t('superAdminUsersCreate.formDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('superAdminUsersCreate.usernameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('superAdminUsersCreate.usernamePlaceholder')} {...field} />
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
                      <FormLabel>{t('superAdminUsersCreate.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('superAdminUsersCreate.emailPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('superAdminUsersCreate.passwordLabel')}</FormLabel>
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
                      <FormLabel>{t('superAdminUsersCreate.confirmPasswordLabel')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('superAdminUsersCreate.roleLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('superAdminUsersCreate.rolePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">{t('superAdminUsersCreate.roleAdmin')}</SelectItem>
                        <SelectItem value="employee">{t('superAdminUsersCreate.roleEmployee')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('superAdminUsersCreate.nameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('superAdminUsersCreate.namePlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('superAdminUsersCreate.nameDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('superAdminUsersCreate.contactLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('superAdminUsersCreate.contactPlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('superAdminUsersCreate.contactDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full md:w-auto">
                <Save className="mr-2 h-4 w-4" /> {t('superAdminUsersCreate.saveButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
