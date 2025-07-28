
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { getFirebaseApp, db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface SessionContextType {
  currentUser: User;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const guestUser: User = {
  id: 'guest',
  username: 'guest',
  email: 'guest@example.com',
  name: 'Invitado',
  avatarUrl: 'https://placehold.co/100x100.png?text=G',
  role: 'guest',
  status: 'active',
  registrationDate: new Date(0).toISOString(),
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(guestUser);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuario autenticado en Firebase, ahora busca sus datos en Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as Omit<User, 'id'>;
          setCurrentUser({ id: firebaseUser.uid, ...userData });
          localStorage.setItem('currentUser', JSON.stringify({ id: firebaseUser.uid, ...userData }));
        } else {
          // El usuario existe en Auth pero no en Firestore, situación anómala.
          console.warn(`Usuario ${firebaseUser.uid} existe en Auth pero no en Firestore. Cerrando sesión.`);
          await auth.signOut();
          setCurrentUser(guestUser);
          localStorage.removeItem('currentUser');
        }
      } else {
        setCurrentUser(guestUser);
        localStorage.removeItem('currentUser');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback((user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      await auth.signOut();
      localStorage.removeItem('currentUser');
      setCurrentUser(guestUser);
      toast({ title: 'Cierre de sesión', description: 'Has cerrado sesión correctamente.' });
      router.push('/login');
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cerrar la sesión.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, router]);

  // Protección de rutas
  useEffect(() => {
    if (!isLoading && currentUser.role === 'guest') {
      const protectedRoutes = ['/admin', '/superadmin', '/employee'];
      const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
      if (isProtected) {
        router.push('/login');
      }
    }
  }, [isLoading, currentUser.role, pathname, router]);


  const value: SessionContextType = {
    currentUser,
    isLoading,
    login,
    logout,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
