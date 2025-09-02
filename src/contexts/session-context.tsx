"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as FirebaseUserType } from 'firebase/auth';
import type { User } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

interface SessionContextType {
  currentUser: User | null;
  isLoading: boolean;
  logout: () => void;
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
    // Convert Firestore Timestamps to ISO strings for serialization safety
    for (const key in data) {
        const value = data[key];
        if (value instanceof Timestamp) {
            data[key] = value.toDate().toISOString();
        } else if (value && typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
            // Handle cases where Timestamp might be a plain object
            data[key] = new Date(value.seconds * 1000).toISOString();
        }
    }
    return data as User;
};

// Rutas que no requieren autenticación
const publicRoutes = ['/', '/login', '/register'];

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const user = serializeUser(firebaseUser, userDocSnap.data());
            setCurrentUser(user);
          } else {
            console.warn(`No user document found for UID: ${firebaseUser.uid}. Forcing logout.`);
            await auth.signOut();
            setCurrentUser(null);
          }
        } catch (error) {
            console.error("Error fetching user document:", error);
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

  // Redirección del lado del cliente
  useEffect(() => {
    if (!isLoading) {
      const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/menu/');
      
      if (!currentUser && !isPublic) {
        router.push('/login');
      } else if (currentUser && (pathname === '/login' || pathname === '/register')) {
        const targetDashboard = currentUser.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard';
        router.push(targetDashboard);
      }
    }
  }, [currentUser, isLoading, pathname, router]);

  const logout = useCallback(async () => {
    try {
        await auth.signOut();
        setCurrentUser(null);
        router.push('/login');
    } catch (error) {
        console.error("Error logging out:", error);
    }
  }, [router]);

  const value = {
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
