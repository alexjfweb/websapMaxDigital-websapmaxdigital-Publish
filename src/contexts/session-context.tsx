
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/types';
import { useRouter, usePathname } from 'next/navigation';

// ✅ LAZY LOADING: Solo importar toast cuando sea necesario
let useToast: any = null;

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

// ✅ FUNCIÓN UTILITARIA PARA SERIALIZAR USUARIO (sin importaciones estáticas)
const serializeUser = (firebaseUser: any, firestoreData: any): User => {
  const data = { id: firebaseUser.uid, ...firestoreData };
  // Recorrer el objeto para convertir cualquier Timestamp a ISO string
  for (const key in data) {
    if (data[key] && typeof data[key] === 'object' && data[key].seconds && typeof data[key].nanoseconds === 'number') {
      // Timestamp object detected
      data[key] = new Date(data[key].seconds * 1000).toISOString();
    } else if (data[key] && typeof data[key] === 'object' && typeof data[key].toDate === 'function') {
      // Firebase Timestamp with toDate method
      data[key] = data[key].toDate().toISOString();
    }
  }
  return data as User;
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ LAZY LOADING DE FIREBASE: Solo cargar cuando sea necesario
  useEffect(() => {
    const loadFirebaseAndInitAuth = async () => {
      try {
        // Cargar Firebase dinámicamente
        const [
          { getAuth, onAuthStateChanged },
          { getFirebaseApp, db },
          { doc, getDoc }
        ] = await Promise.all([
          import("firebase/auth"),
          import("@/lib/firebase"),
          import('firebase/firestore')
        ]);

        setFirebaseLoaded(true);

        const app = getFirebaseApp();
        const auth = getAuth(app);
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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

        // Cleanup function
        return () => unsubscribe();
      } catch (error) {
        console.error("Error loading Firebase:", error);
        setIsLoading(false);
      }
    };

    let cleanup: (() => void) | undefined;
    
    loadFirebaseAndInitAuth().then((cleanupFn) => {
      if (typeof cleanupFn === 'function') {
        cleanup = cleanupFn;
      }
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  // ✅ NAVEGACIÓN INTELIGENTE
  useEffect(() => {
    if (isLoading || !firebaseLoaded) return;

    const isAuthPage = ['/login', '/register'].includes(pathname);
    const isPublicPage = isAuthPage || pathname === '/' || pathname.startsWith('/menu/');
    
    if (!currentUser && !isPublicPage) {
      router.push('/login');
    } else if (currentUser && isAuthPage) {
      const targetDashboard = `/${currentUser.role}/dashboard`;
      router.push(targetDashboard);
    }
  }, [currentUser, isLoading, firebaseLoaded, pathname, router]);

  // ✅ LOGOUT CON CARGA DINÁMICA
  const logout = useCallback(async () => {
    try {
      // Cargar toast dinámicamente solo cuando se necesite
      if (!useToast) {
        const toastModule = await import('@/hooks/use-toast');
        useToast = toastModule.useToast;
      }
      
      // Cargar Firebase Auth dinámicamente
      const [
        { getAuth },
        { getFirebaseApp }
      ] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase")
      ]);

      const auth = getAuth(getFirebaseApp());
      await auth.signOut(); 
      setCurrentUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Si hay error cargando toast, usar console.error como fallback
      if (useToast) {
        const { toast } = useToast();
        toast({ 
          title: 'Error', 
          description: 'No se pudo cerrar la sesión.', 
          variant: 'destructive' 
        });
      }
    }
  }, [router]);

  const value = {
    currentUser: currentUser,
    isLoading: isLoading || !firebaseLoaded,
    logout,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// ✅ EXPORTACIÓN NOMBRADA para lazy loading si es necesario en otros sitios
export default SessionProvider;
