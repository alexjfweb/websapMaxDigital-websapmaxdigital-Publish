"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
// ¡CAMBIO IMPORTANTE AQUÍ! Importamos 'auth' y 'db' directamente.
import { auth, db } from '@/lib/firebase'; 
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface SessionContextType {
  currentUser: User | null;
  isLoading: boolean;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

const serializeUser = (firebaseUser: FirebaseUser, firestoreData: any): User => {
  const data = { id: firebaseUser.uid, ...firestoreData };
  for (const key in data) {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate().toISOString();
    }
  }
  return data as User;
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ¡CAMBIO IMPORTANTE AQUÍ! Usamos la instancia 'auth' importada.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const user = serializeUser(firebaseUser, userDocSnap.data());
          setCurrentUser(user);
        } else {
          await auth.signOut();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []); // El array de dependencias vacío es correcto aquí.

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = ['/login', '/register'].includes(pathname);
    const isPublicPage = isAuthPage || pathname === '/' || pathname.startsWith('/menu/');
    const userRole = currentUser?.role;

    if (!userRole && !isPublicPage) {
      router.push('/login');
    } else if (userRole && isAuthPage) {
      const targetDashboard = `/${userRole}/dashboard`;
      router.push(targetDashboard);
    }
  }, [currentUser, isLoading, pathname, router]);

  const logout = useCallback(async () => {
    try {
      // Usamos la instancia 'auth' importada.
      await auth.signOut(); 
      setCurrentUser(null);
      router.push('/login');
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cerrar la sesión.', variant: 'destructive' });
    }
  }, [toast, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verificando sesión...</span>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ currentUser, isLoading, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
