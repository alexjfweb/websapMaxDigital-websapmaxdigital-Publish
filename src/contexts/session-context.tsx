
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { getFirebaseApp, db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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


export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as Omit<User, 'id'>;
          const userWithId: User = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              ...userData,
              companyId: userData.companyId || undefined,
          };

          setCurrentUser(userWithId);
          console.log(`✅ Sesión iniciada para ${userWithId.email} con companyId: ${userWithId.companyId}`);
        } else {
          console.error(`🔴 Usuario ${firebaseUser.uid} existe en Auth pero no en Firestore. Cerrando sesión forzosa.`);
          await auth.signOut();
          setCurrentUser(guestUser);
        }
      } else {
        console.log("🟡 No hay usuario de Firebase. Estableciendo sesión de invitado.");
        setCurrentUser(guestUser);
      }
      setIsLoading(false);
      console.log("🔵 SessionProvider: Carga de sesión finalizada.");
    });

    return () => {
      console.log("🔵 SessionProvider: Desmontado. Limpiando listener de Auth.");
      unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      await auth.signOut();
      // onAuthStateChanged se encargará de setear a guest y redirigir
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cerrar la sesión.', variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    // **NO HACER NADA HASTA QUE TERMINE LA CARGA INICIAL**
    if (isLoading) return;

    const isAuthPage = ['/login', '/register'].includes(pathname);
    const isPublicPage = isAuthPage || pathname === '/' || pathname.startsWith('/menu/');
    const userRole = currentUser?.role || 'guest';
    
    // Si el usuario no está logueado (es guest) y intenta acceder a una página protegida
    if (userRole === 'guest' && !isPublicPage) {
        console.log(`🔵 Redirigiendo: Página protegida (${pathname}) y usuario no autenticado.`);
        router.push('/login');
    }
    // Si el usuario ya está logueado y intenta acceder a login/register
    else if (userRole !== 'guest' && isAuthPage) {
        const targetDashboard = `/${userRole}/dashboard`;
        console.log(`🔵 Redirigiendo: Usuario ya logueado. Enviando a ${targetDashboard}.`);
        router.push(targetDashboard);
    }
  }, [isLoading, currentUser, pathname, router]);

  // Si aún está cargando y no tenemos usuario, mostramos un loader genérico
  // para evitar que se renderice el layout completo prematuramente.
  if (isLoading || !currentUser) {
     return (
        <div className="flex min-h-svh w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Verificando sesión...</span>
        </div>
    );
  }


  const value: SessionContextType = {
    currentUser,
    isLoading,
    logout,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
