
"use client";

import useSWR from 'swr';
import { useSession } from '@/contexts/session-context';
import { useSubscription } from '@/hooks/use-subscription';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, getCountFromServer } from 'firebase/firestore';

interface PlanLimits {
  current: {
    tables: number;
    reservations: number;
    employees: number;
    orders: number;
    dishes: number; // Añadido
    suggestions: number; // Añadido
  };
  max: {
    tables: number;
    reservations: number;
    employees: number;
    orders: number;
    dishes: number; // Añadido
    suggestions: number; // Añadido
  };
  reached: {
    tables: boolean;
    reservations: boolean;
    employees: boolean;
    orders: boolean;
    dishes: boolean; // Añadido
    suggestions: boolean; // Añadido
  };
}

const fetchCurrentUsage = async (companyId: string): Promise<PlanLimits['current']> => {
  const db = getDb();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const getCount = async (collectionName: string, extraConditions: any[] = []) => {
    const collRef = collection(db, collectionName);
    const q = query(collRef, where('restaurantId', '==', companyId), ...extraConditions);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  };
  
  const getCountForCompany = async (collectionName: string) => {
    const collRef = collection(db, collectionName);
    const q = query(collRef, where('companyId', '==', companyId));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  };


  const [tablesCount, reservationsCount, employeesCount, ordersCount, dishesCount, suggestionsCount] = await Promise.all([
    getCountForCompany('tables'),
    getCount('reservations', [where('createdAt', '>=', Timestamp.fromDate(startOfMonth))]),
    getCountForCompany('users'), // Asumiendo que 'users' tiene 'companyId' para empleados. ¡OJO! Esto contará todos los usuarios de la empresa. Corregir si es necesario.
    getCount('orders', [where('date', '>=', Timestamp.fromDate(startOfMonth))]),
    getCountForCompany('dishes'),
    getCount('suggestionLogs', [where('timestamp', '>=', Timestamp.fromDate(startOfMonth))]), // Asumiendo una colección de logs
  ]);

  return { 
    tables: tablesCount, 
    reservations: reservationsCount, 
    employees: employeesCount, // Revisar si este query es correcto para solo empleados
    orders: ordersCount,
    dishes: dishesCount,
    suggestions: suggestionsCount
  };
};

const getDefaultLimits = (): PlanLimits => ({
  current: { tables: 0, reservations: 0, employees: 0, orders: 0, dishes: 0, suggestions: 0 },
  max: { tables: -1, reservations: -1, employees: -1, orders: -1, dishes: -1, suggestions: -1 },
  reached: { tables: false, reservations: false, employees: false, orders: false, dishes: false, suggestions: false },
});

export function usePlanLimits() {
  const { currentUser, isLoading: isSessionLoading } = useSession();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();
  const companyId = currentUser?.companyId;

  const { data: usage, error, isLoading: isUsageLoading } = useSWR(
    companyId ? ['usage', companyId] : null,
    ([, id]) => fetchCurrentUsage(id as string),
    { revalidateOnFocus: false }
  );

  const isLoading = isSessionLoading || isSubscriptionLoading || isUsageLoading;

  const plan = subscription?.plan;
  const limits: PlanLimits = getDefaultLimits();

  if (plan && usage) {
    const maxLimits = {
      tables: plan.maxProjects ?? -1,
      reservations: plan.maxReservations ?? -1,
      employees: plan.maxUsers ?? -1,
      orders: plan.maxOrders ?? -1,
      dishes: plan.maxDishes ?? -1, // Añadido
      suggestions: plan.maxSuggestions ?? -1, // Añadido
    };

    limits.current = usage;
    limits.max = maxLimits;

    limits.reached.tables = maxLimits.tables === -1 ? false : usage.tables >= maxLimits.tables;
    limits.reached.reservations = maxLimits.reservations === -1 ? false : usage.reservations >= maxLimits.reservations;
    limits.reached.employees = maxLimits.employees === -1 ? false : usage.employees >= maxLimits.employees;
    limits.reached.orders = maxLimits.orders === -1 ? false : usage.orders >= maxLimits.orders;
    limits.reached.dishes = maxLimits.dishes === -1 ? false : usage.dishes >= maxLimits.dishes;
    limits.reached.suggestions = maxLimits.suggestions === -1 ? false : usage.suggestions >= maxLimits.suggestions;
  }

  return {
    limits,
    isLimitsLoading: isLoading,
    error,
  };
}
