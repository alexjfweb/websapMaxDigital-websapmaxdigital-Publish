
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getFirebaseApp, db } from "@/lib/firebase"; 
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
    // Recorrer el objeto para convertir cualquier Timestamp a ISO string
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        } else if (data[key] && typeof data[key].seconds === 'number' && typeof data[key].nanoseconds === 'number') {
            // Manejar el caso de objeto de timestamp serializado
            data[key] = new Timestamp(data[key].seconds, data[key].nanoseconds).toDate().toISOString();
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
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true); // Siempre empezar como cargando al cambiar el estado de auth
      if (firebaseUser) {
        try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const user = serializeUser(firebaseUser, userDocSnap.data());
              setCurrentUser(user);
            } else {
              console.warn(`No user document found for UID: ${firebaseUser.uid}. Logging out.`);
              await auth.signOut();
              setCurrentUser(null);
            }
        } catch (error) {
            console.error("Error fetching user data from Firestore:", error);
            await auth.signOut();
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = ['/login', '/register'].includes(pathname);
    const isPublicPage = isAuthPage || pathname === '/' || pathname.startsWith('/menu/');
    
    if (!currentUser && !isPublicPage) {
      router.push('/login');
    } else if (currentUser && isAuthPage) {
      const targetDashboard = `/${currentUser.role}/dashboard`;
      router.push(targetDashboard);
    }
  }, [currentUser, isLoading, pathname, router]);

  const logout = useCallback(async () => {
    try {
      const auth = getAuth(getFirebaseApp());
      await auth.signOut(); 
      setCurrentUser(null);
      router.push('/login');
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cerrar la sesión.', variant: 'destructive' });
    }
  }, [toast, router]);

  const value = {
      currentUser: currentUser,
      isLoading,
      logout,
  };

  if (isLoading && !['/', '/login', '/register'].includes(pathname) && !pathname.startsWith('/menu/')) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verificando sesión...</span>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
