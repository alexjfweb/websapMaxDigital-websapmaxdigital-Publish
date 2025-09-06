
"use client";

import useSWR from 'swr';
import type { User } from '@/types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

const fetcher = async (): Promise<User[]> => {
  const db = getDb();
  if (!db) {
    throw new Error("La base de datos no está disponible.");
  }
  
  const usersCollection = collection(db, "users");
  const q = query(usersCollection, orderBy("registrationDate", "desc"));
  
  const querySnapshot = await getDocs(q);
  const users: User[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({ 
        id: doc.id,
        ...data,
        registrationDate: data.registrationDate // Mantenemos el formato original por ahora
    } as User);
  });
  
  return users;
};

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<User[]>('all-users', fetcher, {
    revalidateOnFocus: false,
  });

  return {
    users: data || [],
    isLoading,
    error,
    refreshUsers: mutate,
  };
}
