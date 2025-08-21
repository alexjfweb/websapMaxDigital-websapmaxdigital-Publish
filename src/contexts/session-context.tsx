
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as FirebaseUserType } from 'firebase/auth';
import type { User } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase'; // Usar la instancia centralizada
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, Timestamp } from 'firebase/firestore';
import { toast } from "@/hooks/use-toast";

interface SessionContextType {
  currentUser: User | null;
  isLoading: boolean;
  logout: () => void;
  login: (user: User) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

const serializeUser = (firebaseUser: FirebaseUserType, firestoreData: any): User => {
    const data = { id: firebaseUser.uid, ...firestoreData };
    for (const key in data) {
        const value = data[key];
        if (value instanceof Timestamp) {
            data[key] = value.toDate().toISOString();
        } else if (value && typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
            data[key] = new Date(value.seconds * 1000).toISOString();
        }
    }
    return data as User;
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
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
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';
    
    if (currentUser && isAuthPage) {
      const targetDashboard = `/${currentUser.role}/dashboard`;
      router.push(targetDashboard);
    }
  }, [currentUser, isLoading, pathname, router]);

  const logout = useCallback(async () => {
    try {
        await auth.signOut();
        setCurrentUser(null);
        router.push('/login');
        toast({ title: 'Cierre de sesión exitoso' });
    } catch (error) {
        toast({ title: 'Error', description: 'No se pudo cerrar la sesión.', variant: 'destructive' });
    }
  }, [router]);

  const login = (user: User) => {
    setCurrentUser(user);
    setIsLoading(false);
  };

  const value = {
    currentUser,
    isLoading,
    logout,
    login,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
