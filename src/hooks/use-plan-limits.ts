
"use client";

import useSWR from 'swr';
import { useSession } from '@/contexts/session-context';
import { useSubscription } from '@/hooks/use-subscription';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getCountFromServer, Timestamp } from 'firebase/firestore';

interface PlanLimits {
  current: {
    tables: number;
    reservations: number;
    employees: number;
    orders: number;
    dishes: number;
    suggestions: number;
  };
  max: {
    tables: number;
    reservations: number;
    orders: number;
    employees: number;
    dishes: number;
    suggestions: number;
  };
  reached: {
    tables: boolean;
    reservations: boolean;
    orders: boolean;
    employees: boolean;
    dishes: boolean;
    suggestions: boolean;
  };
}

const fetchCurrentUsage = async (companyId: string): Promise<PlanLimits['current']> => {
  const db = getDb();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const getCount = async (collectionName: string, extraConditions: any[] = []) => {
    // La colección de 'orders' usa 'restaurantId', el resto 'companyId'.
    const idField = collectionName === 'orders' ? 'restaurantId' : 'companyId';
    const collRef = collection(db, collectionName);
    const q = query(collRef, where(idField, '==', companyId), ...extraConditions);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  };

  const [tablesCount, reservationsCount, employeesCount, ordersCount, dishesCount, suggestionsCount] = await Promise.all([
    getCount('tables'),
    getCount('reservations', [where('createdAt', '>=', Timestamp.fromDate(startOfMonth))]),
    getCount('users', [where('role', '==', 'employee')]), // Contar solo empleados
    getCount('orders', [where('date', '>=', Timestamp.fromDate(startOfMonth))]),
    getCount('dishes'),
    getCount('suggestionLogs', [where('timestamp', '>=', Timestamp.fromDate(startOfMonth))]),
  ]);

  return { 
    tables: tablesCount, 
    reservations: reservationsCount, 
    employees: employeesCount,
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
      dishes: plan.maxDishes ?? -1,
      suggestions: plan.maxSuggestions ?? -1,
    };

    limits.current = usage;
    limits.max = maxLimits;

    limits.reached.tables = maxLimits.tables === -1 ? false : usage.tables >= maxLimits.tables;
    limits.reached.reservations = maxLimits.reservations === -1 ? false : usage.reservations >= maxLimits.reservations;
    limits.reached.employees = maxLimits.employees === -1 ? false : usage.employees >= maxLimits.employees;
    limits.reached.orders = maxLimits.orders === -1 ? false : usage.orders >= maxLimits.orders;
    limits.reached.dishes = maxLimits.dishes === -1 ? false : usage.dishes >= maxLimits.dishes;
    limits.reached.suggestions = maxLimits.suggestions === -1 ? false : usage.suggestions >= maxLimits.suggestions;
  } else if (plan) {
    // Si tenemos el plan pero no el uso, aún podemos setear los máximos
    limits.max = {
      tables: plan.maxProjects ?? -1,
      reservations: plan.maxReservations ?? -1,
      employees: plan.maxUsers ?? -1,
      orders: plan.maxOrders ?? -1,
      dishes: plan.maxDishes ?? -1,
      suggestions: plan.maxSuggestions ?? -1,
    };
  }

  return {
    limits,
    isLimitsLoading: isLoading,
    error,
  };
}
