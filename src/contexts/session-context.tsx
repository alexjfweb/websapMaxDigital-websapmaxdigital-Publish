
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase'; // Importar auth directamente
import { onAuthStateChanged } from 'firebase/auth'; // Importar onAuthStateChanged

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
  name: 'Guest User',
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

  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth no está inicializado.");
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // En un caso real, aquí buscarías los detalles del usuario en tu DB (Firestore)
        // Por ahora, usamos el localStorage como fallback para la demo.
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          if (parsedUser.id === firebaseUser.uid) {
            setCurrentUser(parsedUser);
          }
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
    if (auth) {
      await auth.signOut();
    }
    localStorage.removeItem('currentUser');
    setCurrentUser(guestUser);
    toast({ title: 'Cierre de sesión', description: 'Has cerrado sesión correctamente.' });
    router.push('/login');
  }, [toast, router]);

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
