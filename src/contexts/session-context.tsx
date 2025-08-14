
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { getFirebaseApp, db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface SessionContextType {
  currentUser: User; // Cambiado para que nunca sea null
  isLoading: boolean;
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
    const app = getFirebaseApp();
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      let finalUser: User = guestUser;
      
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          finalUser = { id: firebaseUser.uid, ...userDocSnap.data() } as User;
        } else {
          console.error(`Usuario ${firebaseUser.uid} no encontrado en Firestore. Cerrando sesión.`);
          await auth.signOut();
        }
      }
      
      setCurrentUser(finalUser);
      setIsLoading(false);
      
      // --- LÓGICA DE REDIRECCIÓN CENTRALIZADA ---
      // Se ejecuta DESPUÉS de determinar el estado final del usuario.
      const isAuthPage = ['/login', '/register'].includes(pathname);
      const isPublicPage = isAuthPage || pathname === '/' || pathname.startsWith('/menu/');
      const userRole = finalUser.role;

      if (userRole === 'guest' && !isPublicPage) {
        console.log(`[Redirect Logic] Usuario invitado en página protegida (${pathname}). Redirigiendo a /login.`);
        router.push('/login');
      } else if (userRole !== 'guest' && isAuthPage) {
        const targetDashboard = `/${userRole}/dashboard`;
        console.log(`[Redirect Logic] Usuario logueado en página de auth. Redirigiendo a ${targetDashboard}.`);
        router.push(targetDashboard);
      }
      // Si ninguna de las condiciones se cumple, el usuario puede permanecer en la página actual.
      // --- FIN DE LA LÓGICA DE REDIRECCIÓN ---
    });

    return () => unsubscribe();
    // La dependencia de `pathname` y `router` se elimina para evitar el bucle.
    // La lógica ahora está autocontenida en el callback del listener.
  }, []);

  const logout = useCallback(async () => {
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      await auth.signOut();
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
