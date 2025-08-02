
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
  uid: 'guest',
  username: 'guest',
  email: 'guest@example.com',
  name: 'Invitado',
  avatarUrl: 'https://placehold.co/100x100.png?text=G',
  role: 'guest',
  status: 'active',
  registrationDate: new Date(0).toISOString(),
  companyId: undefined,
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
    console.log("🔵 SessionProvider: Montado. Configurando listener de Auth...");
    const app = getFirebaseApp();
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log("🔵 Auth state changed. Firebase user:", firebaseUser?.uid || 'Ninguno');
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as Omit<User, 'id'>;
              // Aseguramos que el companyId del documento de usuario se asigne correctamente.
              const userWithId: User = {
                  id: firebaseUser.uid,
                  uid: firebaseUser.uid,
                  ...userData,
                  companyId: userData.companyId, // Asignación explícita y correcta
              };

              setCurrentUser(userWithId);
              localStorage.setItem('currentUser', JSON.stringify(userWithId));
              console.log(`✅ Sesión iniciada para ${userWithId.email} con companyId: ${userWithId.companyId}`);
            } else {
              console.error(`🔴 Usuario ${firebaseUser.uid} existe en Auth pero no en Firestore. Cerrando sesión forzosa.`);
              await auth.signOut();
            }
        } catch(e) {
            console.error("🔴 Error crítico al obtener documento del usuario:", e);
            await auth.signOut();
        }
      } else {
        console.log("🟡 No hay usuario de Firebase. Estableciendo sesión de invitado.");
        setCurrentUser(guestUser);
        localStorage.removeItem('currentUser');
      }
      setIsLoading(false);
      console.log("🔵 SessionProvider: Carga de sesión finalizada.");
    });

    return () => {
      console.log("🔵 SessionProvider: Desmontado. Limpiando listener de Auth.");
      unsubscribe();
    };
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
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cerrar la sesión.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isLoading) return;

    const isProtected = ['/admin', '/superadmin', '/employee'].some(route => pathname.startsWith(route));
    
    if (isProtected && currentUser.role === 'guest') {
        console.log(`🔵 Redirigiendo: Página protegida (${pathname}) y usuario no autenticado.`);
        router.push('/login');
    } else if (pathname === '/login' && currentUser.role !== 'guest') {
        const targetDashboard = `/${currentUser.role}/dashboard`;
        console.log(`🔵 Redirigiendo: Usuario ya logueado. Enviando a ${targetDashboard}.`);
        router.push(targetDashboard);
    }
  }, [isLoading, currentUser, pathname, router]);


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
