
"use client";

import useSWR from 'swr';
import type { User } from '@/types';
import { useSession } from '@/contexts/session-context';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const fetchEmployees = async (companyId: string): Promise<User[]> => {
  if (!db) {
    throw new Error("La base de datos no está disponible.");
  }
  const q = query(
    collection(db, "users"), 
    where("companyId", "==", companyId), 
    where("role", "==", "employee")
  );
  
  const querySnapshot = await getDocs(q);
  const employees: User[] = [];
  querySnapshot.forEach((doc) => {
    employees.push({ id: doc.id, ...doc.data() } as User);
  });
  
  return employees;
};

export function useEmployees(companyId?: string) {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const effectiveCompanyId = companyId || currentUser.companyId;

  // Key for SWR should be unique for the query. Using an array is a good practice.
  const swrKey = effectiveCompanyId ? ['employees', effectiveCompanyId] : null;

  const { data, error, isLoading, mutate } = useSWR<User[]>(
    swrKey,
    () => fetchEmployees(effectiveCompanyId!), // The fetcher is only called if swrKey is not null
    {
      revalidateOnFocus: false,
    }
  );

  return {
    employees: data || [],
    isLoading: isSessionLoading || isLoading,
    error,
    refreshEmployees: mutate,
  };
}
