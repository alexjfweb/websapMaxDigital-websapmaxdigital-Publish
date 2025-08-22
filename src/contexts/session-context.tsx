
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as FirebaseUserType } from 'firebase/auth';
import type { User } from '@/types';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, Timestamp } from 'firebase/firestore';

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

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until first check is done
  const router = useRouter();

  useEffect(() => {
    const db = getFirestore();
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
