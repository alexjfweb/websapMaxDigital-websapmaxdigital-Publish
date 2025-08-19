"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as FirebaseUserType } from 'firebase/auth'; // Renombramos para evitar conflictos
import type { User } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase-lazy'; // Usar lazy loading
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
    let unsubscribe: (() => void) | null = null;
    
    // Función asíncrona para inicializar la autenticación
    const initAuthListener = async () => {
      try {
        const auth = await getFirebaseAuth(); // Obtener auth de forma lazy
        const { getDb } = await import('@/lib/firebase-lazy');
        const db = await getDb();

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
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
          } catch (error) {
            console.error("Error during auth state change:", error);
            setCurrentUser(null);
          } finally {
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error("Failed to initialize Firebase Auth listener:", error);
        setIsLoading(false); // Detener la carga si Firebase no se puede inicializar
      }
    };
    
    // Iniciar la escucha solo si no estamos en la página de inicio
    if (pathname !== '/') {
        initAuthListener();
    } else {
        setIsLoading(false); // Para la página de inicio, no esperamos a Firebase
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [pathname]); // Depende del pathname para re-evaluar si cargar Firebase

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isPublicRoute = isAuthPage || pathname === '/';
    
    if (!currentUser && !isPublicRoute) {
      router.push('/login');
    } else if (currentUser && isAuthPage) {
      const targetDashboard = `/${currentUser.role}/dashboard`;
      router.push(targetDashboard);
    }
  }, [currentUser, isLoading, pathname, router]);

  const logout = useCallback(async () => {
    try {
        const auth = await getFirebaseAuth();
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
