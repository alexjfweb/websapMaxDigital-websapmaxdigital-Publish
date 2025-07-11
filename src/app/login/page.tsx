
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
import { LogIn } from "lucide-react";
import { useRouter } from 'next/navigation';
import type { User, UserRole } from "@/types";

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const mockUsersCredentials: Record<string, { password: string; role: UserRole; name: string; avatarUrl?: string }> = {
  "superadmin@example.com": { password: "SuperAdmin2023", role: "superadmin", name: "Super Admin", avatarUrl: "https://placehold.co/100x100.png?text=SA" },
  "admin@example.com": { password: "Admin2023", role: "admin", name: "Admin User", avatarUrl: "https://placehold.co/100x100.png?text=AU" },
  "empleado@example.com": { password: "Empleado2023", role: "employee", name: "Employee User", avatarUrl: "https://placehold.co/100x100.png?text=EU" },
};

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginFormSchema>) {
    const userCredential = mockUsersCredentials[values.email];

    if (userCredential && userCredential.password === values.password) {
      const loggedInUser: User = {
        id: values.email, // Using email as ID for mock
        username: userCredential.name.toLowerCase().replace(' ', '.'),
        email: values.email,
        role: userCredential.role,
        name: userCredential.name,
        avatarUrl: userCredential.avatarUrl,
        status: 'active', // Mock status
        registrationDate: new Date().toISOString(), // This is safe as it runs after a user action
      };
      
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      
      toast({
        title: "Login Successful!",
        description: `Welcome, ${userCredential.name}! Redirecting...`,
      });

      switch (userCredential.role) {
        case "superadmin":
          router.push("/superadmin/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "employee":
          router.push("/employee/dashboard");
          break;
        default:
          router.push("/"); // Fallback to home
      }
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
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
          <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription>Log in to access your websapMax account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-3">
                <LogIn className="mr-2 h-5 w-5" /> Log In
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
           <Link href="#" className="text-sm text-primary hover:underline">
              Forgot your password?
            </Link>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
